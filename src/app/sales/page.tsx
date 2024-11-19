'use client'

import { useState, useEffect } from 'react'
import { executeQuery, selectQuery } from '@/utils/database'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Sales() {
    const [customers, setCustomers] = useState([])
    const [orders, setOrders] = useState([])
    const [products, setProducts] = useState([])
    const [newCustomer, setNewCustomer] = useState({ name: '' })
    const [newOrder, setNewOrder] = useState({ customerId: '', productId: '', quantity: '', orderDate: '', completionDate: '', notes: '' })

    useEffect(() => {
        fetchCustomers()
        fetchOrders()
        fetchProducts()
    }, [])

    const fetchCustomers = async () => {
        const fetchedCustomers = await selectQuery('SELECT * FROM customers')
        setCustomers(fetchedCustomers)
    }

    const fetchOrders = async () => {
        const fetchedOrders = await selectQuery('SELECT * FROM orders')
        setOrders(fetchedOrders)
    }

    const fetchProducts = async () => {
        const fetchedProducts = await selectQuery('SELECT * FROM products')
        setProducts(fetchedProducts)
    }

    const addCustomer = async () => {
        await executeQuery(
            'INSERT INTO customers (name) VALUES ($1)',
            [newCustomer.name]
        )
        setNewCustomer({ name: '' })
        fetchCustomers()
    }

    const deleteCustomer = async (id) => {
        await executeQuery('DELETE FROM customers WHERE id = $1', [id])
        fetchCustomers()
    }

    const addOrder = async () => {
        await executeQuery(
            'INSERT INTO orders (customer_id, product_id, quantity, order_date, completion_date, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [newOrder.customerId, newOrder.productId, newOrder.quantity, newOrder.orderDate, newOrder.completionDate, 'Draft', newOrder.notes]
        )
        setNewOrder({ customerId: '', productId: '', quantity: '', orderDate: '', completionDate: '', notes: '' })
        fetchOrders()
    }

    const updateOrderStatus = async (orderId, status) => {
        await executeQuery(
            'UPDATE orders SET status = $1 WHERE id = $2',
            [status, orderId]
        )
        fetchOrders()
    }

    const deleteOrder = async (id) => {
        await executeQuery('DELETE FROM orders WHERE id = $1', [id])
        fetchOrders()
    }

    const productTypes = [
        { value: 'raw_lumber', label: 'Raw Lumber' },
        { value: 'dried_lumber', label: 'Dried Lumber' },
        { value: 'separator', label: '---' },
        { value: 'planed_boards', label: 'Planed Boards' },
        { value: 'laths', label: 'Laths' },
        { value: 'beams', label: 'Beams' },
        { value: 'pellets', label: 'Pellets' },
    ]

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Sales Department</h1>

            <Tabs defaultValue="customers" className="w-full">
                <TabsList>
                    <TabsTrigger value="customers">Customers</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                </TabsList>
                <TabsContent value="customers">
                    <h2 className="text-xl font-semibold mt-6 mb-2">Customers</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell>{customer.name}</TableCell>
                                    <TableCell>
                                        <Button onClick={() => deleteCustomer(customer.id)} variant="destructive">Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <h3 className="text-lg font-semibold mt-4 mb-2">Add New Customer</h3>
                    <div className="flex space-x-2 mb-4">
                        <Input
                            placeholder="Name"
                            value={newCustomer.name}
                            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                        />
                        <Button onClick={addCustomer}>Add Customer</Button>
                    </div>
                </TabsContent>
                <TabsContent value="orders">
                    <h2 className="text-xl font-semibold mt-6 mb-2">Orders</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Order Date</TableHead>
                                <TableHead>Completion Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>{customers.find(c => c.id === order.customer_id)?.name || 'Unknown'}</TableCell>
                                    <TableCell>{products.find(p => p.id === order.product_id)?.name || 'Unknown'}</TableCell>
                                    <TableCell>{order.quantity}</TableCell>
                                    <TableCell>{order.order_date}</TableCell>
                                    <TableCell>{order.completion_date}</TableCell>
                                    <TableCell>{order.status}</TableCell>
                                    <TableCell>
                                        <Button onClick={() => updateOrderStatus(order.id, 'AgreedWithClient')} className="mr-2">Agree</Button>
                                        <Button onClick={() => updateOrderStatus(order.id, 'AcceptedForProduction')} className="mr-2">Accept</Button>
                                        <Button onClick={() => updateOrderStatus(order.id, 'Completed')} className="mr-2">Complete</Button>
                                        <Button onClick={() => deleteOrder(order.id)} variant="destructive">Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <h3 className="text-lg font-semibold mt-4 mb-2">Add New Order</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <Select onValueChange={(value) => setNewOrder({ ...newOrder, customerId: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Customer" />
                            </SelectTrigger>
                            <SelectContent>
                                {customers.map((customer) => (
                                    <SelectItem key={customer.id} value={customer.id.toString()}>{customer.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select onValueChange={(value) => setNewOrder({ ...newOrder, productId: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Product" />
                            </SelectTrigger>
                            <SelectContent>
                                {productTypes.map((product) => (
                                    product.value === 'separator' ? (
                                        <SelectSeparator key={product.value} />
                                    ) : (
                                        <SelectItem key={product.value} value={product.value}>{product.label}</SelectItem>
                                    )
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="Quantity"
                            value={newOrder.quantity}
                            onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
                        />
                        <Input
                            type="date"
                            placeholder="Order Date"
                            value={newOrder.orderDate}
                            onChange={(e) => setNewOrder({ ...newOrder, orderDate: e.target.value })}
                        />
                        <Input
                            type="date"
                            placeholder="Completion Date"
                            value={newOrder.completionDate}
                            onChange={(e) => setNewOrder({ ...newOrder, completionDate: e.target.value })}
                        />
                        <Input
                            placeholder="Notes"
                            value={newOrder.notes}
                            onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                        />
                        <Button onClick={addOrder} className="col-span-2">Add Order</Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}