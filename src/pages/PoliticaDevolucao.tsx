import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Clock, Package, RefreshCw } from "lucide-react";

const PoliticaDevolucao = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Política de Devolução
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="text-center">
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">7 Dias</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Prazo para arrependimento
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Package className="h-12 w-12 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Embalagem Original</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Produto na embalagem original
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Estado Perfeito</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sem sinais de uso
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <RefreshCw className="h-12 w-12 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Reembolso Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  100% do valor pago
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Direito de Arrependimento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Conforme o Código de Defesa do Consumidor, você tem o direito de desistir da compra em até 
                  <Badge variant="secondary" className="mx-1">7 dias corridos</Badge>
                  após o recebimento do produto, sem necessidade de justificativa.
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Condições para devolução:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Produto em perfeito estado de conservação</li>
                    <li>• Embalagem original intacta</li>
                    <li>• Todos os acessórios e manuais inclusos</li>
                    <li>• Nota fiscal original</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Como Solicitar a Devolução</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <Badge className="min-w-6 h-6 rounded-full flex items-center justify-center text-xs">1</Badge>
                    <div>
                      <h4 className="font-semibold">Entre em contato</h4>
                      <p className="text-sm text-muted-foreground">
                        Envie um email para contato@techworld.com ou ligue para (11) 9999-9999
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Badge className="min-w-6 h-6 rounded-full flex items-center justify-center text-xs">2</Badge>
                    <div>
                      <h4 className="font-semibold">Aguarde a autorização</h4>
                      <p className="text-sm text-muted-foreground">
                        Enviaremos um código de autorização e instruções para envio
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Badge className="min-w-6 h-6 rounded-full flex items-center justify-center text-xs">3</Badge>
                    <div>
                      <h4 className="font-semibold">Embale o produto</h4>
                      <p className="text-sm text-muted-foreground">
                        Use a embalagem original e inclua todos os acessórios
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Badge className="min-w-6 h-6 rounded-full flex items-center justify-center text-xs">4</Badge>
                    <div>
                      <h4 className="font-semibold">Envie o produto</h4>
                      <p className="text-sm text-muted-foreground">
                        Utilize o código de postagem que enviaremos por email
                      </p>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prazos e Reembolsos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Processamento</h4>
                    <p className="text-sm text-muted-foreground">
                      Até 3 dias úteis após recebermos o produto em nosso centro de distribuição
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Reembolso</h4>
                    <p className="text-sm text-muted-foreground">
                      Cartão: 2 faturas | PIX/Débito: até 5 dias úteis | Boleto: até 10 dias úteis
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Produtos com Restrições</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <h4 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">
                    Produtos que não podem ser devolvidos:
                  </h4>
                  <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                    <li>• Software com lacre rompido</li>
                    <li>• Produtos personalizados ou sob encomenda</li>
                    <li>• Produtos com sinais de uso ou danos causados pelo cliente</li>
                    <li>• Produtos higienizáveis (fones de ouvido, headsets)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Precisa de Ajuda?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Nossa equipe está pronta para ajudar com qualquer dúvida sobre devoluções.
                </p>
                <div className="space-y-2">
                  <p><strong>Email:</strong> contato@techworld.com</p>
                  <p><strong>Telefone:</strong> (11) 9999-9999</p>
                  <p><strong>WhatsApp:</strong> (11) 99999-9999</p>
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

export default PoliticaDevolucao;