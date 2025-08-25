import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardToken } from '../entities/card-token.entity';
import { EncryptionService } from './encryption.service';
import { CreateCardTokenDto, TokenResponseDto, DecryptedCardDataDto } from '../dto/create-token.dto';
import { CardNetwork, maskCardNumber, validateCardNumber } from '@fugata/shared';

@Injectable()
export class TokenVaultService {
  constructor(
    @InjectRepository(CardToken)
    private cardTokenRepository: Repository<CardToken>,
    private encryptionService: EncryptionService,
  ) {}

  async createToken(createTokenDto: CreateCardTokenDto): Promise<TokenResponseDto> {
    // Validate card number
    const validationResult = validateCardNumber(createTokenDto.cardNumber, {
      allowSpaces: true,
      allowDashes: true,
      strictMode: false
    });

    if (!validationResult.isValid) {
      throw new BadRequestException(`Invalid card number: ${validationResult.error}`);
    }

    const token = this.encryptionService.generateToken();
    
    // Use normalized card number from validation
    const cardNumber = validationResult.normalizedNumber!;
    const bin = cardNumber.substring(0, 6);
    const last4 = cardNumber.substring(cardNumber.length - 4);

    // Encrypt sensitive data
    const encryptedCardNumber = this.encryptionService.encrypt(cardNumber);
    const encryptedCardHolderName = createTokenDto.cardHolderName 
      ? this.encryptionService.encrypt(createTokenDto.cardHolderName) 
      : undefined;

    // Use detected card network from validation, or fallback to provided one
    let cardNetwork = createTokenDto.cardNetwork;
    if (!cardNetwork && validationResult.cardNetwork) {
      cardNetwork = validationResult.cardNetwork as CardNetwork;
    }
    const maskedNumber = maskCardNumber(cardNumber, cardNetwork);

    // Create card token entity
    const cardToken = this.cardTokenRepository.create({
      token,
      merchantId: createTokenDto.merchantId,
      customerId: createTokenDto.customerId,
      paymentMethod: createTokenDto.paymentMethod,
      cardNetwork,
      encryptedCardNumber,
      encryptedCardHolderName,
      maskedNumber,
      bin,
      last4,
      expiryMonth: createTokenDto.expiryMonth,
      expiryYear: createTokenDto.expiryYear,
      isActive: true,
    });

    const savedToken = await this.cardTokenRepository.save(cardToken);

    return this.mapToResponseDto(savedToken);
  }

  async getToken(token: string, merchantId: string): Promise<TokenResponseDto> {
    const cardToken = await this.cardTokenRepository.findOne({
      where: { token, merchantId, isActive: true }
    });

    if (!cardToken) {
      throw new NotFoundException('Token not found or inactive');
    }

    return this.mapToResponseDto(cardToken);
  }

  async decryptToken(token: string, merchantId: string): Promise<DecryptedCardDataDto> {
    const cardToken = await this.cardTokenRepository.findOne({
      where: { token, merchantId, isActive: true }
    });

    if (!cardToken) {
      throw new NotFoundException('Token not found or inactive');
    }

    const cardNumber = this.encryptionService.decrypt(cardToken.encryptedCardNumber);
    const cardHolderName = cardToken.encryptedCardHolderName 
      ? this.encryptionService.decrypt(cardToken.encryptedCardHolderName) 
      : undefined;

    return {
      cardNumber,
      cardHolderName,
      expiryMonth: cardToken.expiryMonth,
      expiryYear: cardToken.expiryYear,
    };
  }

  async deactivateToken(token: string, merchantId: string): Promise<void> {
    const cardToken = await this.cardTokenRepository.findOne({
      where: { token, merchantId }
    });

    if (!cardToken) {
      throw new NotFoundException('Token not found');
    }

    cardToken.isActive = false;
    await this.cardTokenRepository.save(cardToken);
  }

  async getTokensByCustomer(customerId: string, merchantId: string): Promise<TokenResponseDto[]> {
    const tokens = await this.cardTokenRepository.find({
      where: { customerId, merchantId, isActive: true },
      order: { createdAt: 'DESC' }
    });

    return tokens.map(token => this.mapToResponseDto(token));
  }

  async getTokensByMerchant(merchantId: string): Promise<TokenResponseDto[]> {
    const tokens = await this.cardTokenRepository.find({
      where: { merchantId, isActive: true },
      order: { createdAt: 'DESC' }
    });

    return tokens.map(token => this.mapToResponseDto(token));
  }

  private mapToResponseDto(cardToken: CardToken): TokenResponseDto {
    return {
      token: cardToken.token,
      maskedNumber: cardToken.maskedNumber,
      bin: cardToken.bin,
      last4: cardToken.last4,
      expiryMonth: cardToken.expiryMonth,
      expiryYear: cardToken.expiryYear,
      cardNetwork: cardToken.cardNetwork,
      issuerName: cardToken.issuerName,
      country: cardToken.country,
      isActive: cardToken.isActive,
      createdAt: cardToken.createdAt,
      expiresAt: cardToken.expiresAt,
    };
  }
}
