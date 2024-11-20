'use client'

import { useState, useEffect } from 'react'
import { selectQuery } from '@/utils/database'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function Production() {
    const [orders, setOrders] = useState([])
    const [customers, setCustomers] = useState([])
    const [products, setProducts] = useState([])

    useEffect(() => {
        fetchOrders()
        fetchCustomers()
        fetchProducts()
    }, [])

    const fetchOrders = async () => {
        const fetchedOrders = await selectQuery(
            "SELECT * FROM orders WHERE status IN ('AcceptedForProduction', 'Completed')"
        )
        setOrders(fetchedOrders)
    }

    const fetchCustomers = async () => {
        const fetchedCustomers = await selectQuery('SELECT * FROM customers')
        setCustomers(fetchedCustomers)
    }

    const fetchProducts = async () => {
        const fetchedProducts = await selectQuery('SELECT * FROM products')
        setProducts(fetchedProducts)
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Служба производства</h1>

            {/*<h2 className="text-xl font-semibold mt-6 mb-2">Production Orders</h2>*/}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID заказа</TableHead>
                        <TableHead>Клиент</TableHead>
                        <TableHead>Продукт</TableHead>
                        <TableHead>Количество</TableHead>
                        <TableHead>Дата заказа</TableHead>
                        <TableHead>Дедлайн</TableHead>
                        <TableHead>Статус</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell>{order.id}</TableCell>
                            <TableCell>{customers.find(c => c.id === order.customer_id)?.name || 'Unknown'}</TableCell>
                            <TableCell>{products.find(p => p.id === order.product_id)?.name || 'Unknown'}</TableCell>
                            <TableCell>{order.quantity}</TableCell>
                            <TableCell>{order.order_date}</TableCell>
                            <TableCell>{order.completion_date}</TableCell>
                            <TableCell>{order.status}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}