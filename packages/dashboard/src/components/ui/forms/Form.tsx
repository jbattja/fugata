export default function Form({ children, title, handleSubmit }: { children: React.ReactNode, title: string, handleSubmit: (e: React.FormEvent) => void }) {

    return (
        <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">{title}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
            {children}
        </form>
        </div>
    )
}
