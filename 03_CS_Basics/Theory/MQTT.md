# MQTT
- **MQTT는 IoT(사물인터넷)에서 센서나 기기 간 통신을 위한 초경량 메시지 프로토콜**

## MQTT란?
- Message Queuing Telemetry Transport
- TCP/IP 기반의 publish/subscribe(pub/sub) 방식 메시징 프로토콜
- IoT 기기처럼 리소스가 적고, 네트워크가 불안정한 환경에서도 안정적인 통신을 위해 설계됨.

## 작동 방식 (Pub / Sub 구조)
MQTT는 전통적인 클라이언트~서버 모델이 아니라 아래 구조로 동작.
```scss
Publisher(발행자) -> MQTT Broker <- Subscriber(구독자)
```
- **Publisher**: 메시지를 보내는 쪽 (예: 온도 센서)
- **Subscriber** : 메시지를 구독해서 받는 쪽 (예: 스마트폰 앱)
- **Broker**: 메시지를 중계하는 서버 (예: Mosquitto)
➡️ Publisher가 **topic**에 메시지를 발행하면
➡️ 같은 topic을 구독 중인 Subscriber들이 메시지를 받음.

---

## 예시
### 상황
- 온도 센서가 10초마다 `room/temperature`라는 토픽으로 데이터를 보냄
- 스마트팜 제어 서버는 이 토픽을 구독하고 자동으로 팬을 켬
```bash
센서 -> publish("room/temperature", "28도")
제어 서버 -> subscribe("room/temperature") -> "28도" 감지 -> 팬 작동
```

---

## 주요 특징
| 항목 | 설명 |
| --- | --- |
| 경량성 | 헤더가 작고 메시지 크기도 작아서 저사양 장치에 적합 |
| QoS 지원 | 메시지 품질 보장 수준 선택 가능 (0, 1, 2 단계) |
| 연결 유지(ping) | 비정상 연결 끊김을 감지해서 자동 복구 |
| TLS 암호화 | 보안 통신도 가능 (옵션) |
| 주제(topic) 기반 | 트리 구조로 주제 구성 -> `farm/greenhouse/temperature`처럼 세분화 가능 |

---
