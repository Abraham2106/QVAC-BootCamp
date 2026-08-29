# Bibliografía preparada — Clase 11

## Delegated Inference over P2P · Hyperswarm · HyperDHT

La Clase 11 todavía no tiene paquete publicado en `main`. Esta bibliografía queda preparada para integrarla cuando se implemente la clase. Las fuentes de Holepunch/Hyperswarm son autoridad para la capa P2P; la documentación de QVAC debe ser autoridad para el protocolo de delegated inference y el uso de `providerPublicKey`.

### QVAC — delegated inference

1. **QVAC — Delegated inference.** Fuente primaria para provider/client roles, conexión directa por `providerPublicKey` y semántica del flujo delegado.  
   https://docs.qvac.tether.io/p2p-capabilities/delegated-inference/

2. **QVAC — Blind relays.** Complemento para comprender conectividad cuando los peers no pueden conectarse directamente.  
   https://docs.qvac.tether.io/p2p-capabilities/blind-relays/

3. **QVAC — API Summary.** Firmas actuales de las primitives P2P.  
   https://docs.qvac.tether.io/reference/api/

### Holepunch / Hypercore stack

4. **Hyperswarm — repositorio oficial.** Networking P2P y discovery/connections en el stack Holepunch.  
   https://github.com/holepunchto/hyperswarm

5. **HyperDHT — repositorio oficial.** DHT utilizada por Hyperswarm para descubrimiento/conectividad.  
   https://github.com/holepunchto/hyperdht

6. **Hyperswarm DHT README.** Documentación histórica/complementaria del DHT.  
   https://github.com/holepunchto/hyperswarm-dht/blob/master/README.md

7. **Hypercore protocol.** Contexto de protocol stack y primitives P2P.  
   https://hypercore-protocol.github.io/new-website/protocol/

8. **Hyperswarm module guide.** Guía de uso del módulo y modelo de swarm.  
   https://hypercore-protocol.github.io/new-website/guides/modules/hyperswarm/

9. **P2P for Web Developers — networking primer.** Fuente pedagógica secundaria para conceptos de NAT, peers y discovery.  
   https://dev.to/erndob/p2p-for-web-devs-part-1-networking-1961

### Distributed inference

10. **_Towards Distributed Inference of LLMs on a P2P Network_.** Trabajo reciente sobre inferencia distribuida en topologías P2P; útil como contraste con delegated inference de QVAC.  
    https://arxiv.org/abs/2606.17059

## Nota de integración futura

Cuando exista `class-11-*`, mover o copiar esta bibliografía a `class-11-.../bibliography.md` y exponerla mediante `ClassLessonLinks`. No asumir topic discovery en QVAC delegated inference: la documentación actual describe conexión directa al provider mediante `providerPublicKey` sobre Hyperswarm DHT.