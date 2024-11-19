'use client'

import { useState, useEffect } from 'react'
import { executeQuery, selectQuery } from '@/utils/database'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Technology() {
    const [products, setProducts] = useState([])
    const [newProduct, setNewProduct] = useState({ name: '', type: '' })

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        const fetchedProducts = await selectQuery('SELECT * FROM products')
        setProducts(fetchedProducts)
    }

    const addProduct = async () => {
        await executeQuery(
            'INSERT INTO products (name, type) VALUES ($1, $2)',
            [newProduct.name, newProduct.type]
        )
        setNewProduct({ name: '', type: '' })
        fetchProducts()
    }

    const deleteProduct = async (id) => {
        await executeQuery('DELETE FROM products WHERE id = $1', [id])
        fetchProducts()
    }

    const productTypes = ['Raw Lumber', 'Dried Lumber', 'Planed Boards', 'Laths', 'Beams', 'Pellets']

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Technology Department</h1>

            <h2 className="text-xl font-semibold mt-6 mb-2">Products</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.type}</TableCell>
                            <TableCell>
                                <Button onClick={() => deleteProduct(product.id)} variant="destructive">Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <h3 className="text-lg font-semibold mt-4 mb-2">Add New Product</h3>
            <div className="flex space-x-2 mb-4">
                <Input
                    placeholder="Name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
                <Select onValueChange={(value) => setNewProduct({ ...newProduct, type: value })}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Product Type" />
                    </SelectTrigger>
                    <SelectContent>
                        {productTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button onClick={addProduct}>Add Product</Button>
            </div>
        </div>
    )
}