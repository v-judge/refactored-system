import Link from 'next/link'
import { Home, ShoppingCart, Factory, Cpu } from 'lucide-react'

export function Sidebar() {
    return (
        <aside className="w-64 bg-gray-100 p-4 h-screen">
            <nav className="space-y-2">
                <Link href="/" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
                    <Home className="w-5 h-5" />
                    <span>Хаб</span>
                </Link>
                <Link href="/sales" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
                    <ShoppingCart className="w-5 h-5" />
                    <span>Коммерческая служба</span>
                </Link>
                <Link href="/production" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
                    <Factory className="w-5 h-5" />
                    <span>Служба производства</span>
                </Link>
                <Link href="/technology" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
                    <Cpu className="w-5 h-5" />
                    <span>Служба технолога</span>
                </Link>
            </nav>
        </aside>
    )
}