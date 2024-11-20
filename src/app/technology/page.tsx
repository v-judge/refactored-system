'use client'

import { useState, useEffect } from 'react'
import { executeQuery, selectQuery } from '@/utils/database'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {Trash2} from "lucide-react";

export default function Technology() {
    const [products, setProducts] = useState([])
    const [newProduct, setNewProduct] = useState({ name: '' })

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        const fetchedProducts = await selectQuery('SELECT * FROM products')
        setProducts(fetchedProducts)
    }

    const addProduct = async () => {
        await executeQuery(
            'INSERT INTO products (name) VALUES ($1)',
            [newProduct.name]
        )
        setNewProduct({ name: '' })
        fetchProducts()
    }

    const deleteProduct = async (id) => {
        await executeQuery('DELETE FROM products WHERE id = $1', [id])
        fetchProducts()
    }

    const productTypes = ['Raw Lumber', 'Dried Lumber', 'Planed Boards', 'Laths', 'Beams', 'Pellets']

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Служба технолога</h1>

            <h2 className="text-xl font-semibold mt-6 mb-2">Продукты</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Наименование</TableHead>
                        <TableHead>Удалить</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>
                                <Button onClick={() => deleteProduct(product.id)} variant="destructive">
                                    <Trash2/>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <h3 className="text-lg font-semibold mt-4 mb-2">Добавить продукт</h3>
            <div className="flex space-x-2 mb-4">
                <Input
                    placeholder="Наименование"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
                <Button onClick={addProduct}>Добавить</Button>
            </div>
        </div>
    )
}