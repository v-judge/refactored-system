"use client";

import { useState, useEffect } from "react";
import { executeQuery, selectQuery } from "@/utils/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { PencilIcon, TrashIcon, XCircleIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Sales() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [newCustomer, setNewCustomer] = useState({ name: "" });
  const [newOrder, setNewOrder] = useState({
    customerId: "",
    productId: "",
    quantity: "",
    orderDate: new Date().toISOString().split("T")[0],
    completionDate: "",
    notes: "",
    status: "Черновик",
  });
  const [editingOrder, setEditingOrder] = useState(null);
  const [isAddOrderDialogOpen, setIsAddOrderDialogOpen] = useState(false);
  const [isEditOrderDialogOpen, setIsEditOrderDialogOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchCustomers = async () => {
    const fetchedCustomers = await selectQuery("SELECT * FROM customers");
    setCustomers(fetchedCustomers);
  };

  const fetchOrders = async () => {
    const fetchedOrders = await selectQuery("SELECT * FROM orders");
    setOrders(fetchedOrders);
  };

  const fetchProducts = async () => {
    const fetchedProducts = await selectQuery("SELECT * FROM products");
    setProducts(fetchedProducts);
  };

  const addCustomer = async () => {
    if (!newCustomer.name.trim()) {
      toast({
        description: "Наименование не может быть пусто",
        variant: "destructive",
      });
      return;
    }
    await executeQuery("INSERT INTO customers (name) VALUES ($1)", [
      newCustomer.name,
    ]);
    setNewCustomer({ name: "" });
    fetchCustomers();
  };

  const deleteCustomer = async (id) => {
    await executeQuery("DELETE FROM customers WHERE id = $1", [id]);
    fetchCustomers();
    toast({ description: "Клиент удален", variant: "destructive" });
  };

  const addOrder = async () => {
    await executeQuery(
      "INSERT INTO orders (customer_id, product_id, quantity, order_date, completion_date, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [
        newOrder.customerId,
        newOrder.productId,
        newOrder.quantity,
        newOrder.orderDate,
        newOrder.completionDate,
        newOrder.status,
        newOrder.notes,
      ]
    );
    setNewOrder({
      customerId: "",
      productId: "",
      quantity: "",
      orderDate: new Date().toISOString().split("T")[0],
      completionDate: "",
      notes: "",
      status: "Черновик",
    });
    setIsAddOrderDialogOpen(false);
    fetchOrders();
    toast({ description: "Заказ создан" });
  };

  const updateOrder = async () => {
    // Check if the order is not a draft
    if (editingOrder.status !== "Черновик") {
      // Validate changes for non-draft orders
      if (
        editingOrder.customer_id !== editingOrder.originalCustomerId ||
        editingOrder.product_id !== editingOrder.originalProductId ||
        editingOrder.order_date !== editingOrder.originalOrderDate
      ) {
        toast({
          title: "Ошибка",
          description:
            "Невозможно изменить клиента, вид или дату регистрации для согласованных заказов",
          variant: "destructive",
        });
        return;
      }
    }

    // Allow quantity changes for all orders
    const quantityChanged =
      editingOrder.quantity !== editingOrder.originalQuantity;

    // Check status promotion rules
    if (
      editingOrder.status !== editingOrder.originalStatus &&
      !canPromoteOrder(editingOrder)
    ) {
      toast({
        title: "Ошибка",
        description:
          "Невозможно изменить статус заказа, так как не все обязательные поля заполнены",
        variant: "destructive",
      });
      return;
    }

    // Proceed with update
    await executeQuery(
      "UPDATE orders SET customer_id = $1, product_id = $2, quantity = $3, order_date = $4, completion_date = $5, status = $6, notes = $7 WHERE id = $8",
      [
        editingOrder.customer_id,
        editingOrder.product_id,
        editingOrder.quantity,
        editingOrder.order_date,
        editingOrder.completion_date,
        editingOrder.status,
        editingOrder.notes,
        editingOrder.id,
      ]
    );

    // Prepare toast message
    const messages = [];
    if (quantityChanged) {
      messages.push("Количество изменено");
    }
    if (editingOrder.status !== editingOrder.originalStatus) {
      messages.push(`Статус изменен на "${editingOrder.status}"`);
    }

    // Show toast with combined message
    if (messages.length > 0) {
      toast({
        description: messages.join(". "),
      });
    }

    setIsEditOrderDialogOpen(false);
    fetchOrders();
  };

  const deleteOrder = async (id) => {
    await executeQuery("DELETE FROM orders WHERE id = $1", [id]);
    fetchOrders();
    toast({ description: "Заказ удален", variant: "destructive" });
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    await executeQuery("UPDATE orders SET status = $1 WHERE id = $2", [
      newStatus,
      orderId,
    ]);
    fetchOrders();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getOrderRowColor = (status) => {
    switch (status) {
      case "Черновик":
        return "bg-gray-100";
      case "Согласовано с клиентом":
        return "bg-yellow-100";
      case "Принято в производство":
        return "bg-blue-100";
      case "Выполнен":
        return "bg-green-100";
      default:
        return "";
    }
  };

  const canPromoteOrder = (order) => {
    return (
      order.customer_id &&
      order.product_id &&
      order.quantity &&
      order.order_date
    );
  };

  const clearDate = (field) => {
    setEditingOrder((prev) => ({ ...prev, [field]: null }));
  };

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
                      <Button
                        onClick={() => deleteCustomer(customer.id)}
                        variant="destructive"
                        size="icon"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">Удалить</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md sticky bottom-0">
            <h3 className="text-xl font-semibold mb-4">Добавить Клиента</h3>
            <div className="flex space-x-2">
              <Input
                placeholder="Наименование"
                value={newCustomer.name}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
                className="flex-grow"
              />
              <Button onClick={addCustomer}>Добавить</Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="orders">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Заказы</h2>
              <Button onClick={() => setIsAddOrderDialogOpen(true)}>
                Создать Заказ
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Вид</TableHead>
                  <TableHead>Количество, шт</TableHead>
                  <TableHead>Дата регистрации</TableHead>
                  <TableHead>Дедлайн</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Действие</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow
                    key={order.id}
                    className={getOrderRowColor(order.status)}
                  >
                    <TableCell>{order.id}</TableCell>
                    <TableCell>
                      {customers.find((c) => c.id === order.customer_id)
                        ?.name || "Н/Д"}
                    </TableCell>
                    <TableCell>
                      {products.find((p) => p.id === order.product_id)?.name ||
                        "Н/Д"}
                    </TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>{formatDate(order.order_date)}</TableCell>
                    <TableCell>{formatDate(order.completion_date)}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {order.status === "Черновик" &&
                          canPromoteOrder(order) && (
                            <Button
                              onClick={() =>
                                updateOrderStatus(
                                  order.id,
                                  "Согласовано с клиентом"
                                )
                              }
                              size="sm"
                            >
                              Согласовано
                            </Button>
                          )}
                        {order.status === "Согласовано с клиентом" && (
                          <Button
                            onClick={() =>
                              updateOrderStatus(
                                order.id,
                                "Принято в производство"
                              )
                            }
                            size="sm"
                          >
                            В производстве
                          </Button>
                        )}
                        {order.status === "Принято в производство" && (
                          <Button
                            onClick={() =>
                              updateOrderStatus(order.id, "Выполнен")
                            }
                            size="sm"
                          >
                            Выполнен
                          </Button>
                        )}
                        <Button
                          onClick={() => {
                            setEditingOrder({
                              ...order,
                              originalCustomerId: order.customer_id,
                              originalProductId: order.product_id,
                              originalQuantity: order.quantity,
                              originalOrderDate: order.order_date,
                              originalStatus: order.status,
                            });
                            setIsEditOrderDialogOpen(true);
                          }}
                          size="icon"
                          variant="outline"
                        >
                          <PencilIcon className="h-4 w-4" />
                          <span className="sr-only">Редактировать</span>
                        </Button>
                        <Button
                          onClick={() => deleteOrder(order.id)}
                          variant="destructive"
                          size="icon"
                        >
                          <TrashIcon className="h-4 w-4" />
                          <span className="sr-only">Удалить</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog
        open={isAddOrderDialogOpen}
        onOpenChange={setIsAddOrderDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создание заказа</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer" className="text-right">
                Клиент
              </Label>
              <Select
                onValueChange={(value) =>
                  setNewOrder({ ...newOrder, customerId: value })
                }
                value={newOrder.customerId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Выберите Клиента" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem
                      key={customer.id}
                      value={customer.id.toString()}
                    >
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product" className="text-right">
                Вид
              </Label>
              <Select
                onValueChange={(value) =>
                  setNewOrder({ ...newOrder, productId: value })
                }
                value={newOrder.productId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Выберите Вид" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Количество, шт
              </Label>
              <Input
                id="quantity"
                placeholder="Количество, шт"
                type="number"
                value={newOrder.quantity}
                onChange={(e) =>
                  setNewOrder({ ...newOrder, quantity: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="orderDate" className="text-right">
                Дата регистрации
              </Label>
              <Input
                id="orderDate"
                type="date"
                value={newOrder.orderDate}
                onChange={(e) =>
                  setNewOrder({ ...newOrder, orderDate: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="completionDate" className="text-right">
                Дедлайн
              </Label>
              <Input
                id="completionDate"
                type="date"
                value={newOrder.completionDate}
                onChange={(e) =>
                  setNewOrder({ ...newOrder, completionDate: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Доп. информация
              </Label>
              <Textarea
                id="notes"
                placeholder="Доп. информация"
                value={newOrder.notes}
                onChange={(e) =>
                  setNewOrder({ ...newOrder, notes: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <Button onClick={addOrder}>Создать</Button>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditOrderDialogOpen}
        onOpenChange={setIsEditOrderDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменение заказа</DialogTitle>
          </DialogHeader>
          {editingOrder && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customer" className="text-right">
                  Клиент
                </Label>
                <Select
                  onValueChange={(value) =>
                    setEditingOrder({ ...editingOrder, customer_id: value })
                  }
                  value={editingOrder.customer_id?.toString()}
                  disabled={editingOrder.status !== "Черновик"}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Клиент" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem
                        key={customer.id}
                        value={customer.id.toString()}
                      >
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="product" className="text-right">
                  Вид
                </Label>
                <Select
                  onValueChange={(value) =>
                    setEditingOrder({ ...editingOrder, product_id: value })
                  }
                  value={editingOrder.product_id?.toString()}
                  disabled={editingOrder.status !== "Черновик"}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Вид" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem
                        key={product.id}
                        value={product.id.toString()}
                      >
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Количество, шт
                </Label>
                <Input
                  id="quantity"
                  placeholder="Количество, шт"
                  type="number"
                  value={editingOrder.quantity}
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      quantity: e.target.value,
                    })
                  }
                  className="col-span-3"
                  disabled={editingOrder.status !== "Черновик"}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="orderDate" className="text-right">
                  Дата регистрации
                </Label>
                <div className="col-span-3 flex items-center">
                  <Input
                    id="orderDate"
                    type="date"
                    value={editingOrder.order_date?.split("T")[0]}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        order_date: e.target.value,
                      })
                    }
                    className="flex-grow"
                    disabled={editingOrder.status !== "Черновик"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => clearDate("order_date")}
                    disabled={editingOrder.status !== "Черновик"}
                  >
                    <XCircleIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="completionDate" className="text-right">
                  Дедлайн
                </Label>
                <div className="col-span-3 flex items-center">
                  <Input
                    id="completionDate"
                    type="date"
                    value={editingOrder.completion_date?.split("T")[0]}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        completion_date: e.target.value,
                      })
                    }
                    className="flex-grow"
                    disabled={editingOrder.status !== "Черновик"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => clearDate("completion_date")}
                    disabled={editingOrder.status !== "Черновик"}
                  >
                    <XCircleIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Статус
                </Label>
                <Select
                  onValueChange={(value) =>
                    setEditingOrder({ ...editingOrder, status: value })
                  }
                  value={editingOrder.status}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Черновик">Черновик</SelectItem>
                    <SelectItem value="Согласовано с клиентом">
                      Согласовано с клиентом
                    </SelectItem>
                    <SelectItem value="Принято в производство">
                      Принято в производство
                    </SelectItem>
                    <SelectItem value="Выполнен">Выполнен</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Доп. информация
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Доп. информация"
                  value={editingOrder.notes}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, notes: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <Button onClick={updateOrder}>Обновить заказ</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
