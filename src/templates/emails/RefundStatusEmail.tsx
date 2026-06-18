import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Section,
  Font,
  Tailwind,
} from '@react-email/components';

interface RefundStatusEmailProps {
  refund: {
    code: string;
    amountFormatted: string;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectReason?: string | null;
    refundMethod?: string | null;
    orderId: string;
    customer: {
      name: string;
    };
  };
  companyName?: string;
  year?: string;
}

export default function RefundStatusEmail({
  refund,
  companyName = 'Nude Shop',
  year = new Date().getFullYear().toString(),
}: RefundStatusEmailProps) {
  let title = 'Yêu cầu hoàn trả hàng';
  let statusText = 'ĐANG CHỜ DUYỆT';
  let titleColor = '#5c4e43'; // accent brown
  let mainText = `Chào ${refund.customer.name}, yêu cầu hoàn trả/hoàn tiền cho đơn hàng #${refund.orderId} của bạn đã được ghi nhận.`;
  let instruction = 'Đội ngũ chăm sóc khách hàng của chúng tôi đang xem xét yêu cầu của bạn và sẽ phản hồi trong vòng 24-48 giờ làm việc.';

  if (refund.status === 'APPROVED') {
    title = 'Yêu cầu hoàn trả được chấp nhận';
    statusText = 'ĐÃ CHẤP NHẬN';
    titleColor = '#2e7d32'; // green
    mainText = `Chào ${refund.customer.name}, chúng tôi vui mừng thông báo yêu cầu hoàn trả/hoàn tiền cho đơn hàng #${refund.orderId} đã được duyệt thành công.`;
    instruction = `Số tiền ${refund.amountFormatted} sẽ được hoàn lại cho bạn qua phương thức ${refund.refundMethod || 'chuyển khoản ngân hàng'} trong vòng 3-5 ngày làm việc tùy thuộc vào ngân hàng của bạn.`;
  } else if (refund.status === 'REJECTED') {
    title = 'Yêu cầu hoàn trả từ chối';
    statusText = 'TỪ CHỐI';
    titleColor = '#c62828'; // red
    mainText = `Chào ${refund.customer.name}, rất tiếc yêu cầu hoàn trả/hoàn tiền cho đơn hàng #${refund.orderId} của bạn đã không được chấp thuận.`;
    instruction = refund.rejectReason 
      ? `Lý do từ chối: "${refund.rejectReason}".`
      : 'Yêu cầu của bạn không đáp ứng chính sách đổi trả sản phẩm của chúng tôi.';
  }

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Antonio"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: 'https://fonts.gstatic.com/s/antonio/v16/d6jDMRoTyQ4P-f3VpEM.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Playfair Display"
          fallbackFontFamily="serif"
          webFont={{
            url: 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFiD-vYSZviVYUb_rj3ij__anPXDTjmwiZt8bE.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{title} #{refund.code} - {companyName}</Preview>

      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: '#231f20',
                accent: '#5c4e43',
                offwhite: '#FBF8F3',
              },
              fontFamily: {
                antonio: ['Antonio', 'Helvetica', 'Arial', 'sans-serif'],
                playfair: ['Playfair Display', 'serif'],
              },
            },
          },
        }}
      >
        <Body className="bg-offwhite font-antonio m-0 py-10">
          <Container className="bg-white border-t-4 border-solid border-brand shadow-xl mx-auto" style={{ width: '600px', maxWidth: '100%' }}>
            {/* Header / Logo */}
            <Section className="pt-10 px-10 pb-5 text-center">
              <Text className="font-playfair text-[32px] font-bold text-[#231f20] tracking-[0.25em] m-0 text-center">
                N U D E - S H O P
              </Text>
              <Text className="text-[#999999] text-[10px] tracking-[3px] mt-2.5 mb-0 uppercase">
                Yêu cầu hoàn trả hàng
              </Text>
            </Section>

            {/* Title Section */}
            <Section className="py-6 px-[40px] text-center bg-[#fcfcfc] border-y border-solid border-[#eeeeee]">
              <Text style={{ color: titleColor }} className="font-playfair text-[18px] font-bold m-0 mb-2 uppercase">
                {title}
              </Text>
              <Text className="text-[#666666] text-[14px] m-0">
                {mainText}
              </Text>
            </Section>

            {/* Refund Details */}
            <Section className="py-8 px-[40px]">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '20px' }}>
                <tr style={{ borderBottom: '1px solid #eeeeee' }}>
                  <td style={{ padding: '10px 0', fontSize: '13px', color: '#666666' }}>Mã yêu cầu:</td>
                  <td style={{ padding: '10px 0', fontSize: '13px', color: '#231f20', fontWeight: 'bold', textAlign: 'right' }}>
                    {refund.code}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eeeeee' }}>
                  <td style={{ padding: '10px 0', fontSize: '13px', color: '#666666' }}>Mã đơn hàng liên quan:</td>
                  <td style={{ padding: '10px 0', fontSize: '13px', color: '#231f20', fontWeight: 'bold', textAlign: 'right' }}>
                    #{refund.orderId}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eeeeee' }}>
                  <td style={{ padding: '10px 0', fontSize: '13px', color: '#666666' }}>Lý do hoàn trả:</td>
                  <td style={{ padding: '10px 0', fontSize: '13px', color: '#231f20', fontWeight: 'bold', textAlign: 'right' }}>
                    {refund.reason}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eeeeee' }}>
                  <td style={{ padding: '10px 0', fontSize: '13px', color: '#666666' }}>Trạng thái yêu cầu:</td>
                  <td style={{ padding: '10px 0', fontSize: '13px', color: titleColor, fontWeight: 'bold', textAlign: 'right' }}>
                    {statusText}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 0', fontSize: '14px', fontWeight: 'bold', color: '#231f20' }}>Số tiền hoàn trả dự kiến:</td>
                  <td style={{ padding: '10px 0', fontSize: '16px', fontWeight: 'bold', color: '#5c4e43', textAlign: 'right' }}>
                    {refund.amountFormatted}
                  </td>
                </tr>
              </table>

              <Text className="text-[#444444] text-[13px] leading-[1.6] mt-4 bg-offwhite p-4 border border-solid border-[#eeeeee] rounded">
                {instruction}
              </Text>
            </Section>

            {/* Footer */}
            <Section className="bg-[#fcfcfc] border-t border-solid border-[#eeeeee] p-[30px] text-center">
              <Text className="text-[#999999] font-playfair text-[10px] tracking-[2px] m-0 uppercase">
                © {year} {companyName}. All rights reserved.
              </Text>
              <Text className="text-[#bbbbbb] text-[10px] mt-3 mb-0">
                Nếu bạn có bất kỳ thắc mắc nào về chính sách đổi trả, xin vui lòng liên hệ support@nude-shop.com.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
