import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { productService, ProductListItem } from '@/services/productService';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductFormModal from '@/components/ProductFormModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Trash2, Edit, Plus } from 'lucide-react';

const Admin = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [editingProduct, setEditingProduct] = useState<ProductListItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchProducts();
    }
  }, [user, isAdmin]);

  const fetchProducts = async () => {
    try {
      const result = await productService.getAll({ pageSize: 100 });
      setProducts(result.items);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os produtos',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (product: ProductListItem) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      await productService.delete(productId);
      toast({ title: 'Sucesso', description: 'Produto excluído com sucesso!' });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      const message = error instanceof Error ? error.message : 'Não foi possível excluir o produto';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  if (authLoading) {
    return <div>Carregando...</div>;
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
          <p className="text-muted-foreground">Gerencie produtos e visualize relatórios</p>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Produtos Cadastrados</CardTitle>
                    <CardDescription>Lista de todos os produtos cadastrados</CardDescription>
                  </div>
                  <Button onClick={handleNewProduct} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Produto
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {product.discountPercentage > 0 ? (
                              <>
                                <span className="font-medium text-green-600">
                                  R$ {product.discountedPrice.toFixed(2)}
                                </span>
                                <span className="text-sm text-muted-foreground line-through">
                                  R$ {product.price.toFixed(2)}
                                </span>
                                <Badge variant="secondary">
                                  -{product.discountPercentage}%
                                </Badge>
                              </>
                            ) : (
                              <span className="font-medium">R$ {product.price.toFixed(2)}</span>
                            )}
                            <span className="text-sm text-muted-foreground">
                              Estoque: {product.stock}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {products.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <p>Nenhum produto cadastrado ainda.</p>
                      <Button onClick={handleNewProduct} className="mt-4 flex items-center gap-2 mx-auto">
                        <Plus className="w-4 h-4" />
                        Cadastrar Primeiro Produto
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios de Vendas</CardTitle>
                <CardDescription>Análise de dados e relatórios do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Funcionalidade de relatórios será implementada em breve.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <ProductFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          editingProduct={editingProduct}
          onProductSaved={fetchProducts}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
