'use client'

import { useState, useEffect } from 'react'
import { selectQuery } from '@/utils/database'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Tables() {
    const [customers, setCustomers] = useState([])
    const [orders, setOrders] = useState([])
    const [products, setProducts] = useState([])

    useEffect(() => {
        fetchAllData()
    }, [])

    const fetchAllData = async () => {
        const fetchedCustomers = await selectQuery('SELECT * FROM customers')
        setCustomers(fetchedCustomers)

        const fetchedOrders = await selectQuery('SELECT * FROM orders')
        setOrders(fetchedOrders)

        const fetchedProducts = await selectQuery('SELECT * FROM products')
        setProducts(fetchedProducts)
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Database Tables</h1>

            <Tabs defaultValue="customers" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="customers">Customers</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                </TabsList>
                <TabsContent value="customers">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4">Customers</h2>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Name</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell>{customer.id}</TableCell>
                                        <TableCell>{customer.name}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
                <TabsContent value="orders">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4">Orders</h2>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Customer ID</TableHead>
                                    <TableHead>Product ID</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Order Date</TableHead>
                                    <TableHead>Completion Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.id}</TableCell>
                                        <TableCell>{order.customer_id}</TableCell>
                                        <TableCell>{order.product_id}</TableCell>
                                        <TableCell>{order.quantity}</TableCell>
                                        <TableCell>{order.order_date}</TableCell>
                                        <TableCell>{order.completion_date}</TableCell>
                                        <TableCell>{order.status}</TableCell>
                                        <TableCell>{order.notes}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
                <TabsContent value="products">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4">Products</h2>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>{product.id}</TableCell>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.type}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}