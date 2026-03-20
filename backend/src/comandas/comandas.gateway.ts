import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ComandasGateway {
  @WebSocketServer()
  server: Server;

  notificarNovoPedido(restauranteId: string, pedido: any) {
    this.server.emit(`pedido-${restauranteId}`, pedido);
  }

  notificarPronto(restauranteId: string, item: any) {
    this.server.emit(`pronto-${restauranteId}`, item);
  }
}