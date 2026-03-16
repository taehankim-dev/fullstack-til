# AWS Cloud Infrastructure & Docker Setup Log

AWS 환경에서 EC2 인스턴스를 구축하고, Docker 컨테이너 환경을 설정하여 웹 서버를 구동한 실습 기록입니다.

## 1. 계정 보안 및 비용 관리 (Security & Billing)
- **IAM 사용자 생성**: 루트 계정 보호를 위해 관리자 권한을 가진 IAM 사용자를 별도로 생성하여 사용.
- **MFA 설정**: 루트 계정 및 IAM 계정에 2단계 인증(OTP) 적용.
- **예산 알림(AWS Budgets)**: 예기치 못한 비용 발생 방지를 위해 월 $5 초과 시 알림 설정.

## 2. EC2 인스턴스 구축 (Provisioning)
- **인스턴스 사양**: Amazon Linux 2023, t3.micro (또는 t2.micro)
- **네트워크 보안(Security Group)**:
  - SSH (22번 포트): 관리자 IP만 접속 허용
  - HTTP (80번 포트): 전체 공개 (0.0.0.0/0)

## 3. 서버 접속 및 환경 설정 (Setup)
- **접속 툴**: MobaXterm (SSH)
- **운영체제**: Amazon Linux 2023
- **Docker 설치 명령어**:
  ```bash
  sudo dnf update -y
  sudo dnf install -y docker
  sudo systemctl start docker
  sudo systemctl enable docker
  sudo usermod -aG docker ec2-user

## 4. 서비스 기동 테스트 (Deployment)
- **Docker 실행**: Nginx 공식 이미지 활용하여 컨테이너 구동 확인
  ```bash
  docker run -d -p 80:80 --name my-web nginx
  ```
- **결과**: EC2 퍼블릭 IP 접속 시 "Welcome to Nginx!" 페이지 정상 출력 확인.


## 5. Elastic IP 설정 (탄력적 IP)
- **목적**: 인스턴스 재시작 시 퍼블릭 IP가 변경되는 것을 방지하여 고정된 접속 주소 확보.
- **설정 내용**:
  - AWS Console 에서 새 탄력적 IP 할당 및 실행 중인 EC2 인스턴스에 연결.
  - **주의사항**: 탄력적 IP는 인스턴스에 연결되어 있지 않을 때 비용이 발생하므로 미사용 시 반드시 릴리스 처리 필요.

## 6. 트러블슈팅: Docker 실행 오류 해결
- **문제**: `docker run -d -p 80:80 my-web nginx` 실행 시 `Unable to find image 'my-web:latest' locally` 에러 발생.
- **원인**: Docker 명령어에서 옵션(`--name`) 없이 이름을 입력하여, Docker가 `my-web`을 컨테이너 이름이 아닌 이미지 이름으로 오인함.
- **해결**: `--name` 옵션을 명시하여 이미지 이름과 컨테이너 이름을 명확히 구분함.
  ```bash
  docker run -d -p 80:80 --name my-web nginx

## 7. 객체 스토리지 설정 (Amazon S3)
- **목적**: 서버(EC2)와 저장소(S3)를 분리하여 데이터의 영속성을 확보하고 정적 파일을 효율적으로 서빙.
- **설정 내용**:
  - **버킷 생성**: 전 세계에서 유일한 이름을 가진 버킷 생성 및 리전(서울) 설정.
  - **권한 설정**: 외부 접속 테스트를 위해 '퍼블릭 액세스 차단' 설정을 해제하고 ACL(액세스 제어 목록)을 활성화함.
  - **객체 호스팅**: `AWS.md` 파일을 업로드한 후, 개별 객체 권한을 '퍼블릭 읽기'로 변경하여 고유 URL을 통한 접근 성공.
- **학습 포인트 (Content-Type)**:
  - 파일 접속 시 브라우저에서 바로 출력되지 않고 다운로드되는 현상 확인.
  - 원인: S3 객체의 메타데이터인 `Content-Type`이 `binary/octet-stream`으로 설정되어 발생.
  - 해결: 메타데이터를 `text/plain` 또는 `text/markdown`으로 수정하여 브라우저 내 직접 렌더링 확인.