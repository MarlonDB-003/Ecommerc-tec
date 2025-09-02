import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
  is_active: boolean;
  discount_percentage: number;
}

interface ProductSpecification {
  id?: string;
  product_id: string;
  label: string;
  value: string;
  display_order: number;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  onProductSaved: () => void;
}

const ProductFormModal = ({ isOpen, onClose, editingProduct, onProductSaved }: ProductFormModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [specifications, setSpecifications] = useState<ProductSpecification[]>([]);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
    stock: '',
    discount_percentage: ''
  });

  useEffect(() => {
    if (editingProduct) {
      setProductForm({
        name: editingProduct.name,
        description: editingProduct.description || '',
        price: editingProduct.price.toString(),
        image_url: editingProduct.image_url || '',
        category: editingProduct.category || '',
        stock: editingProduct.stock.toString(),
        discount_percentage: editingProduct.discount_percentage.toString()
      });
      fetchSpecifications(editingProduct.id);
    } else {
      resetForm();
    }
  }, [editingProduct]);

  const fetchSpecifications = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_specifications')
        .select('*')
        .eq('product_id', productId)
        .order('display_order');

      if (error) throw error;
      setSpecifications(data || []);
    } catch (error) {
      console.error('Error fetching specifications:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar especificações",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        image_url: productForm.image_url,
        category: productForm.category,
        stock: parseInt(productForm.stock),
        discount_percentage: parseInt(productForm.discount_percentage) || 0
      };

      let productId: string;

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        productId = editingProduct.id;
        
        toast({
          title: "Sucesso",
          description: "Produto atualizado com sucesso!",
        });
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

        if (error) throw error;
        productId = data.id;
        
        toast({
          title: "Sucesso",
          description: "Produto criado com sucesso!",
        });
      }

      // Save specifications
      if (specifications.length > 0) {
        // Delete existing specifications if editing
        if (editingProduct) {
          await supabase
            .from('product_specifications')
            .delete()
            .eq('product_id', productId);
        }

        // Insert new specifications
        const specsToInsert = specifications
          .filter(spec => spec.label && spec.value)
          .map(spec => ({
            product_id: productId,
            label: spec.label,
            value: spec.value,
            display_order: spec.display_order
          }));

        if (specsToInsert.length > 0) {
          const { error: specsError } = await supabase
            .from('product_specifications')
            .insert(specsToInsert);

          if (specsError) throw specsError;
        }
      }

      onProductSaved();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar produto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSpecifications([]);
    setProductForm({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category: '',
      stock: '',
      discount_percentage: ''
    });
  };

  const addSpecification = () => {
    setSpecifications([...specifications, {
      product_id: '',
      label: '',
      value: '',
      display_order: specifications.length
    }]);
  };

  const updateSpecification = (index: number, field: string, value: string | number) => {
    const updated = [...specifications];
    updated[index] = { ...updated[index], [field]: value };
    setSpecifications(updated);
  };

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? 'Editar Produto' : 'Cadastrar Produto'}
          </DialogTitle>
          <DialogDescription>
            {editingProduct ? 'Edite as informações do produto' : 'Adicione um novo produto ao catálogo'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto</Label>
              <Input
                id="name"
                value={productForm.name}
                onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={productForm.category}
                onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Preço Original (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={productForm.price}
                onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground">
                Este é o preço sem desconto. O desconto será aplicado automaticamente.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stock">Estoque</Label>
              <Input
                id="stock"
                type="number"
                value={productForm.stock}
                onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discount">Desconto (%)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={productForm.discount_percentage}
                onChange={(e) => setProductForm(prev => ({ ...prev, discount_percentage: e.target.value }))}
              />
              {productForm.price && productForm.discount_percentage && parseFloat(productForm.discount_percentage) > 0 && (
                <p className="text-xs text-green-600">
                  Preço com desconto: R$ {(parseFloat(productForm.price) * (1 - parseFloat(productForm.discount_percentage) / 100)).toFixed(2)}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image_url">URL da Imagem</Label>
              <Input
                id="image_url"
                type="url"
                value={productForm.image_url}
                onChange={(e) => setProductForm(prev => ({ ...prev, image_url: e.target.value }))}
              />
            </div>
          </div>

          {/* Specifications Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Especificações do Produto</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSpecification}>
                Adicionar Especificação
              </Button>
            </div>
            
            {specifications.map((spec, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor={`spec-label-${index}`}>Especificação</Label>
                  <Input
                    id={`spec-label-${index}`}
                    placeholder="Ex: GPU, Processador..."
                    value={spec.label}
                    onChange={(e) => updateSpecification(index, 'label', e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor={`spec-value-${index}`}>Valor</Label>
                  <Input
                    id={`spec-value-${index}`}
                    placeholder="Ex: NVIDIA RTX 4080..."
                    value={spec.value}
                    onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                  />
                </div>
                <div className="w-20">
                  <Label htmlFor={`spec-order-${index}`}>Ordem</Label>
                  <Input
                    id={`spec-order-${index}`}
                    type="number"
                    value={spec.display_order}
                    onChange={(e) => updateSpecification(index, 'display_order', parseInt(e.target.value) || 0)}
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeSpecification(index)}
                >
                  Remover
                </Button>
              </div>
            ))}
            
            {specifications.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma especificação adicionada. Clique em "Adicionar Especificação" para começar.
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={productForm.description}
              onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : editingProduct ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormModal;