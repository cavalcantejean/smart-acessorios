export default function Footer() {
  return (
    <footer className="border-t bg-background/80 text-foreground/60">
      <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-6 sm:flex-row">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} SmartAccessoryLink. Todos os direitos reservados.
        </p>
        <p className="text-sm">
          Sua loja completa para as melhores ofertas de acessórios.
        </p>
      </div>
    </footer>
  );
}
