import React, { useState, useEffect, useRef } from 'react';
import { productService, ProductListItem, SpecificationInput } from '@/services/productService';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface SpecRow {
  label: string;
  value: string;
  displayOrder: number;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: ProductListItem | null;
  onProductSaved: () => void;
}

const ProductFormModal = ({ isOpen, onClose, editingProduct, onProductSaved }: ProductFormModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [specifications, setSpecifications] = useState<SpecRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: '',
    brand: '',
    stock: '',
    discountPercentage: '',
  });

  useEffect(() => {
    if (editingProduct) {
      setProductForm({
        name: editingProduct.name,
        description: editingProduct.description ?? '',
        price: editingProduct.price.toString(),
        imageUrl: editingProduct.imageUrl ?? '',
        category: editingProduct.category,
        brand: editingProduct.brand ?? '',
        stock: editingProduct.stock.toString(),
        discountPercentage: editingProduct.discountPercentage.toString(),
      });
      fetchSpecifications(editingProduct.id);
    } else {
      resetForm();
    }
  }, [editingProduct]);

  const fetchSpecifications = async (productId: string) => {
    try {
      const detail = await productService.getById(productId);
      const sorted = [...detail.specifications].sort((a, b) => a.displayOrder - b.displayOrder);
      setSpecifications(sorted.map(s => ({ label: s.label, value: s.value, displayOrder: s.displayOrder })));
    } catch (error) {
      console.error('Error fetching specifications:', error);
      toast({ title: 'Erro', description: 'Erro ao carregar especificações', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const specs: SpecificationInput[] = specifications
        .filter(s => s.label && s.value)
        .map((s, i) => ({ label: s.label, value: s.value, displayOrder: s.displayOrder > 0 ? s.displayOrder : i }));

      const payload = {
        name: productForm.name,
        description: productForm.description || null,
        price: parseFloat(productForm.price),
        imageUrl: productForm.imageUrl || null,
        category: productForm.category,
        brand: productForm.brand || null,
        stock: parseInt(productForm.stock),
        discountPercentage: parseInt(productForm.discountPercentage) || 0,
        specifications: specs,
      };

      if (editingProduct) {
        await productService.update(editingProduct.id, payload);
        toast({ title: 'Sucesso', description: 'Produto atualizado com sucesso!' });
      } else {
        await productService.create(payload);
        toast({ title: 'Sucesso', description: 'Produto criado com sucesso!' });
      }

      onProductSaved();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      const message = error instanceof Error ? error.message : 'Erro ao salvar produto';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSpecifications([]);
    setProductForm({ name: '', description: '', price: '', imageUrl: '', category: '', brand: '', stock: '', discountPercentage: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await api.uploadImage(file);
      setProductForm(prev => ({ ...prev, imageUrl: url }));
      toast({ title: 'Imagem enviada', description: 'Upload concluído com sucesso.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer upload';
      toast({ title: 'Erro no upload', description: message, variant: 'destructive' });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setIsUploading(false);
    }
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { label: '', value: '', displayOrder: specifications.length }]);
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
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                placeholder="Ex: Samsung, Apple, Asus..."
                value={productForm.brand}
                onChange={(e) => setProductForm(prev => ({ ...prev, brand: e.target.value }))}
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
                value={productForm.discountPercentage}
                onChange={(e) => setProductForm(prev => ({ ...prev, discountPercentage: e.target.value }))}
              />
              {productForm.price && productForm.discountPercentage && parseFloat(productForm.discountPercentage) > 0 && (
                <p className="text-xs text-green-600">
                  Preço com desconto: R$ {(parseFloat(productForm.price) * (1 - parseFloat(productForm.discountPercentage) / 100)).toFixed(2)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Imagem do Produto</Label>
              <div className="flex flex-col gap-2">
                {productForm.imageUrl && (
                  <img
                    src={productForm.imageUrl}
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded-md border"
                  />
                )}
                <div className="flex gap-2 items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? 'Enviando...' : productForm.imageUrl ? 'Trocar imagem' : 'Selecionar imagem'}
                  </Button>
                  {productForm.imageUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setProductForm(prev => ({ ...prev, imageUrl: '' }));
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      Remover
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <p className="text-xs text-muted-foreground">JPEG, PNG, WebP ou GIF — máx. 5MB</p>
              </div>
            </div>
          </div>

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
                    value={spec.displayOrder}
                    onChange={(e) => updateSpecification(index, 'displayOrder', parseInt(e.target.value) || 0)}
                  />
                </div>
                <Button type="button" variant="destructive" size="sm" onClick={() => removeSpecification(index)}>
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
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" disabled={isLoading || isUploading}>
              {isLoading ? 'Salvando...' : editingProduct ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormModal;
