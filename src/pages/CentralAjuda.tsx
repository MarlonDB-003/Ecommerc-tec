import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, MessageCircle, Phone, Mail } from "lucide-react";

const CentralAjuda = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Central de Ajuda
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Search className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Encontre Respostas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Pesquise em nossa base de conhecimento para encontrar soluções rápidas.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Chat Online</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Converse com nossos especialistas em tempo real.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Suporte por Telefone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Ligue para (92) 9999-9999 para atendimento direto.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Perguntas Frequentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Como posso rastrear meu pedido?</AccordionTrigger>
                  <AccordionContent>
                    Você pode rastrear seu pedido através do código de rastreamento enviado por email após a confirmação do pagamento. Acesse nossa área "Meus Pedidos" no site ou use o código diretamente no site dos Correios.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Qual o prazo de entrega?</AccordionTrigger>
                  <AccordionContent>
                    O prazo varia de acordo com sua localização e o tipo de produto. Para a região Sudeste, o prazo médio é de 3-5 dias úteis. Para outras regiões, pode variar de 5-12 dias úteis.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Como funciona a garantia dos produtos?</AccordionTrigger>
                  <AccordionContent>
                    Todos os produtos possuem garantia do fabricante. Produtos eletrônicos têm garantia de 12 meses, e componentes de hardware possuem garantia de 24 meses. Em caso de defeito, entre em contato conosco para iniciar o processo.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>Posso cancelar meu pedido?</AccordionTrigger>
                  <AccordionContent>
                    Sim, você pode cancelar seu pedido em até 24 horas após a confirmação, desde que o produto ainda não tenha sido enviado. Entre em contato conosco o quanto antes para processar o cancelamento.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>Quais formas de pagamento vocês aceitam?</AccordionTrigger>
                  <AccordionContent>
                    Aceitamos cartões de crédito (Visa, Mastercard, Elo), débito, PIX, boleto bancário e parcelamento em até 12x sem juros para compras acima de R$ 500.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Ainda precisa de ajuda?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Se não encontrou a resposta que procurava, nossa equipe está pronta para ajudar!
              </p>
              <div className="space-y-2">
                <p><strong>Email:</strong> contato@techworld.com</p>
                <p><strong>Telefone:</strong> (92) 9999-9999</p>
                <p><strong>Horário de atendimento:</strong> Segunda a sexta, das 8h às 18h</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CentralAjuda;