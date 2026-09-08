import api from './axios'
import { unwrapResponse } from './response'

const data = (response) => unwrapResponse(response, 'QR 요청 처리에 실패했습니다.')

export const createPaymentQr = (userCardId, paymentAmount) => {
  const amount = paymentAmount && Number(paymentAmount) > 0 ? Number(paymentAmount) : null;
  const payload = { userCardId: Number(userCardId) };
  if (amount !== null) {
    payload.paymentAmount = amount;
  }
  return api.post('/api/payments/qr', payload).then(data);
}
// 07_25 연동 추가: QR 생성 백엔드 API를 프론트에 연결한다.
