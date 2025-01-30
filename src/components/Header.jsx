export function Header() {
    return (
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold">
          Pix<span className="text-purple-600">Convector</span>
        </h1>
        <nav className="flex gap-6">
          <a
            href="https://github.com/lazxnet/pix-convector"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900"
          >
            GitHub
          </a>
        </nav>
      </header>
    )
  }
  
  