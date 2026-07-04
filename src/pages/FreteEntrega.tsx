import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Clock, Package, Calculator, Shield } from "lucide-react";

const FreteEntrega = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-foreground">
            Frete e Entrega
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Truck className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Entrega Rápida</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Região Sudeste em até 3-5 dias úteis
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Frete Grátis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Compras acima de R$ 299 para todo o Brasil
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Package className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Embalagem Segura</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Produtos protegidos com embalagem especial
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Calculadora de Frete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  O frete é calculado automaticamente no carrinho baseado no seu CEP e nos produtos selecionados.
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Como calcular:</h4>
                  <ol className="space-y-1 text-sm list-decimal list-inside">
                    <li>Adicione os produtos desejados ao carrinho</li>
                    <li>Informe seu CEP na página do carrinho</li>
                    <li>Escolha a modalidade de entrega preferida</li>
                    <li>Visualize o valor e prazo antes de finalizar</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Prazos de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Por Região</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="font-medium">Sudeste</span>
                        <Badge variant="secondary">3-5 dias úteis</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="font-medium">Sul</span>
                        <Badge variant="secondary">4-7 dias úteis</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="font-medium">Nordeste</span>
                        <Badge variant="secondary">5-10 dias úteis</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="font-medium">Centro-Oeste</span>
                        <Badge variant="secondary">5-8 dias úteis</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="font-medium">Norte</span>
                        <Badge variant="secondary">7-12 dias úteis</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Modalidades</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">PAC</span>
                          <Badge variant="outline">Econômico</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Prazo padrão, menor custo</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">SEDEX</span>
                          <Badge variant="outline">Rápido</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Entrega expressa, maior custo</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Transportadora</span>
                          <Badge variant="outline">Grande Porte</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Para produtos grandes e pesados</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Política de Frete Grátis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                  <h4 className="font-semibold mb-2 text-green-800 dark:text-green-200">
                    🎉 Frete Grátis para todo o Brasil!
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Compras acima de <strong>R$ 299,00</strong> têm frete grátis via PAC para qualquer região do país.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Capitais</h4>
                    <p className="text-sm text-muted-foreground">
                      Frete grátis via PAC para todas as capitais em compras acima de R$ 299
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Interior</h4>
                    <p className="text-sm text-muted-foreground">
                      Frete grátis via PAC para cidades do interior em compras acima de R$ 299
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rastreamento de Pedidos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Após a confirmação do pagamento e envio do produto, você receberá:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Badge className="min-w-6 h-6 rounded-full flex items-center justify-center text-xs">1</Badge>
                    <div>
                      <h4 className="font-semibold">Email de confirmação</h4>
                      <p className="text-sm text-muted-foreground">
                        Com o código de rastreamento e link para acompanhamento
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge className="min-w-6 h-6 rounded-full flex items-center justify-center text-xs">2</Badge>
                    <div>
                      <h4 className="font-semibold">Atualizações automáticas</h4>
                      <p className="text-sm text-muted-foreground">
                        SMS e email com status da entrega em tempo real
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge className="min-w-6 h-6 rounded-full flex items-center justify-center text-xs">3</Badge>
                    <div>
                      <h4 className="font-semibold">Portal do cliente</h4>
                      <p className="text-sm text-muted-foreground">
                        Acesse "Meus Pedidos" para acompanhar todas as suas compras
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações Importantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                    <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
                      📦 Produtos grandes e pesados
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Monitores, gabinetes e outros produtos grandes são enviados por transportadora. 
                      O prazo pode variar de 5-15 dias úteis dependendo da região.
                    </p>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <h4 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">
                      ⏰ Horário de processamento
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Pedidos aprovados até 14h são processados no mesmo dia. 
                      Após esse horário, são processados no próximo dia útil.
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                    <h4 className="font-semibold mb-2 text-purple-800 dark:text-purple-200">
                      🎁 Embalagem especial
                    </h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Todos os produtos são embalados com material protetor. 
                      Produtos frágeis recebem embalagem reforçada sem custo adicional.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FreteEntrega;