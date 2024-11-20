'use client'

import { useState, useEffect } from 'react'
import { executeQuery, selectQuery } from '@/utils/database'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { PopoverTrigger, Popover, PopoverContent } from "@/components/ui/popover"
import {Check, ChevronsUpDown, DeleteIcon, LucideDelete, Trash2} from 'lucide-react'
import { cn } from "@/lib/utils"

export default function Sales() {
    const [customers, setCustomers] = useState([])
    const [orders, setOrders] = useState([])
    const [products, setProducts] = useState([])
    const [newCustomer, setNewCustomer] = useState({ name: '' })
    const [newOrder, setNewOrder] = useState({ customerId: '', productId: '', quantity: '', orderDate: '', completionDate: '', notes: '' })
    const [newProduct, setNewProduct] = useState({ name: '' })
    const [openCustomer, setOpenCustomer] = useState(false)
    const [openProduct, setOpenProduct] = useState(false)
    const [filteredCustomers, setFilteredCustomers] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])

    useEffect(() => {
        fetchCustomers()
        fetchOrders()
        fetchProducts()
    }, [])

    useEffect(() => {
        setFilteredCustomers(customers)
        setFilteredProducts(products)
    }, [customers, products])

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

    const addProduct = async () => {
        await executeQuery(
            'INSERT INTO products (name, type) VALUES ($1, $2)',
            [newProduct.name, newProduct.type]
        )
        setNewProduct({ name: '' })
        fetchProducts()
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Коммерческая служба</h1>

            <Tabs defaultValue="customers" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="customers">Клиенты</TabsTrigger>
                    <TabsTrigger value="orders">Заказы</TabsTrigger>
                </TabsList>
                <TabsContent value="customers">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4">Клиенты</h2>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Наименование</TableHead>
                                    <TableHead>Удалить</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell>{customer.id}</TableCell>
                                        <TableCell>{customer.name}</TableCell>
                                        <TableCell>
                                            <Button onClick={() => deleteCustomer(customer.id)} variant="destructive" size="sm">
                                                <Trash2 />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <h3 className="text-xl font-semibold mt-6 mb-4">Добавить Клиента</h3>
                        <div className="flex space-x-2">
                            <Input
                                placeholder="Наименование"
                                value={newCustomer.name}
                                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                className="flex-grow"
                            />
                            <Button onClick={addCustomer}>Добавить Клиента</Button>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="orders">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4">Заказы</h2>
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
                                    <TableHead>Удалить</TableHead>
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
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button onClick={() => updateOrderStatus(order.id, 'AgreedWithClient')} size="sm">Agree</Button>
                                                <Button onClick={() => updateOrderStatus(order.id, 'AcceptedForProduction')} size="sm">Accept</Button>
                                                <Button onClick={() => updateOrderStatus(order.id, 'Completed')} size="sm">Complete</Button>
                                                <Button onClick={() => deleteOrder(order.id)} variant="destructive" size="sm">Delete</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <h3 className="text-xl font-semibold mt-6 mb-4">Создать заказ</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Popover open={openCustomer} onOpenChange={setOpenCustomer}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openCustomer}
                                        className="justify-between"
                                    >
                                        {newOrder.customerId
                                            ? customers.find((customer) => customer.id.toString() === newOrder.customerId)?.name
                                            : "Select customer..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0">
                                    <Command>
                                        <CommandInput
                                            placeholder="Search customer..."
                                            onValueChange={(search) => {
                                                const filtered = customers.filter((customer) =>
                                                    customer.name.toLowerCase().includes(search.toLowerCase())
                                                );
                                                setFilteredCustomers(filtered);
                                            }}
                                        />
                                        <CommandEmpty>No customer found.</CommandEmpty>
                                        <CommandGroup>
                                            <ScrollArea className="h-72">
                                                {filteredCustomers.map((customer) => (
                                                    <CommandItem
                                                        key={customer.id}
                                                        onSelect={() => {
                                                            setNewOrder({ ...newOrder, customerId: customer.id.toString() })
                                                            setOpenCustomer(false)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                newOrder.customerId === customer.id.toString() ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {customer.name}
                                                    </CommandItem>
                                                ))}
                                            </ScrollArea>
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            <Popover open={openProduct} onOpenChange={setOpenProduct}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openProduct}
                                        className="justify-between"
                                    >
                                        {newOrder.productId
                                            ? products.find((product) => product.id.toString() === newOrder.productId)?.name
                                            : "Select product..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0">
                                    <Command>
                                        <CommandInput
                                            placeholder="Search product..."
                                            onValueChange={(search) => {
                                                const filtered = products.filter((product) =>
                                                    product.name.toLowerCase().includes(search.toLowerCase())
                                                );
                                                setFilteredProducts(filtered);
                                            }}
                                        />
                                        <CommandEmpty>No product found.</CommandEmpty>
                                        <CommandGroup>
                                            <ScrollArea className="h-72">
                                                {filteredProducts.map((product) => (
                                                    <CommandItem
                                                        key={product.id}
                                                        onSelect={() => {
                                                            setNewOrder({ ...newOrder, productId: product.id.toString() })
                                                            setOpenProduct(false)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                newOrder.productId === product.id.toString() ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {product.name}
                                                    </CommandItem>
                                                ))}
                                            </ScrollArea>
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            <Input
                                placeholder="Quantity"
                                type="number"
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
                            <Button onClick={addOrder} className="col-span-2">Создать</Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

        </div>
    )
}