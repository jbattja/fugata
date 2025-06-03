import { IsOptional, IsString } from "class-validator";

export class Customer {
  @IsString()
  @IsOptional()
  id?: string;
  
  @IsString()
  @IsOptional()
  customerName?: string;

  @IsString()
  @IsOptional()
  customerEmail?: string;

  @IsString()
  @IsOptional()
  customerCountry?: string;

  @IsString()
  @IsOptional()
  customerLocale?: string;

  constructor(partial: Partial<Customer>) {
    Object.assign(this, partial);
  }

}

export class CustomerBuilder {
  private customer: Partial<Customer> = {};

  withId(id?: string): CustomerBuilder {
    this.customer.id = id;
    return this;
  }

  withCustomerName(customerName?: string): CustomerBuilder {
    this.customer.customerName = customerName;
    return this;
  }         

  withCustomerEmail(customerEmail?: string): CustomerBuilder {
    this.customer.customerEmail = customerEmail;
    return this;
  }

  withCustomerCountry(customerCountry?: string): CustomerBuilder {
    this.customer.customerCountry = customerCountry;
    return this;
  }

  withCustomerLocale(customerLocale?: string): CustomerBuilder {
    this.customer.customerLocale = customerLocale;
    return this;
  }

  build(): Customer {
    return new Customer(this.customer);
  }
}