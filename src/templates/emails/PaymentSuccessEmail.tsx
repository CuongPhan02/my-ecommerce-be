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

interface PaymentSuccessEmailProps {
  order: {
    id: string;
    totalAmountFormatted: string;
    customer: {
      name: string;
    };
    payment: {
      method: string;
      transactionId?: string | null;
    } | null;
  };
  companyName?: string;
  year?: string;
}

export default function PaymentSuccessEmail({
  order,
  companyName = 'Nude Shop',
  year = new Date().getFullYear().toString(),
}: PaymentSuccessEmailProps) {
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
      <Preview>Thanh toán thành công đơn hàng #{order.id} - {companyName}</Preview>

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
                Giao dịch thành công
              </Text>
            </Section>

            {/* Title Section */}
            <Section className="py-6 px-[40px] text-center bg-[#fcfcfc] border-y border-solid border-[#eeeeee]">
              <Text className="text-[#2e7d32] font-playfair text-[20px] font-bold m-0 mb-2">
                THANH TOÁN THÀNH CÔNG!
              </Text>
              <Text className="text-[#666666] text-[14px] m-0">
                Chào <strong>{order.customer.name}</strong>, chúng tôi đã nhận được thanh toán cho đơn hàng <strong>#{order.id}</strong>.
              </Text>
            </Section>

            {/* Payment Details */}
            <Section className="py-8 px-[40px]">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tr style={{ borderBottom: '1px solid #eeeeee' }}>
                  <td style={{ padding: '10px 0', fontSize: '13px', color: '#666666' }}>Mã đơn hàng:</td>
                  <td style={{ padding: '10px 0', fontSize: '13px', color: '#231f20', fontWeight: 'bold', textAlign: 'right' }}>
                    #{order.id}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eeeeee' }}>
                  <td style={{ padding: '10px 0', fontSize: '13px', color: '#666666' }}>Phương thức:</td>
                  <td style={{ padding: '10px 0', fontSize: '13px', color: '#231f20', fontWeight: 'bold', textAlign: 'right' }}>
                    {order.payment?.method || 'VNPAY'}
                  </td>
                </tr>
                {order.payment?.transactionId && (
                  <tr style={{ borderBottom: '1px solid #eeeeee' }}>
                    <td style={{ padding: '10px 0', fontSize: '13px', color: '#666666' }}>Mã giao dịch (VNPAY):</td>
                    <td style={{ padding: '10px 0', fontSize: '13px', color: '#231f20', fontWeight: 'bold', textAlign: 'right' }}>
                      {order.payment.transactionId}
                    </td>
                  </tr>
                )}
                <tr>
                  <td style={{ padding: '10px 0', fontSize: '14px', fontWeight: 'bold', color: '#231f20' }}>Số tiền đã thanh toán:</td>
                  <td style={{ padding: '10px 0', fontSize: '16px', fontWeight: 'bold', color: '#5c4e43', textAlign: 'right' }}>
                    {order.totalAmountFormatted}
                  </td>
                </tr>
              </table>
              <Text className="text-[#666666] text-[13px] leading-[1.6] mt-6">
                Đơn hàng của bạn hiện đang được chuyển sang trạng thái <strong>Đang chuẩn bị hàng (Processing)</strong> và sẽ sớm được giao cho đơn vị vận chuyển. Chúng tôi sẽ cập nhật thêm thông tin hành trình đơn hàng tới bạn qua email.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="bg-[#fcfcfc] border-t border-solid border-[#eeeeee] p-[30px] text-center">
              <Text className="text-[#999999] font-playfair text-[10px] tracking-[2px] m-0 uppercase">
                © {year} {companyName}. All rights reserved.
              </Text>
              <Text className="text-[#bbbbbb] text-[10px] mt-3 mb-0">
                Nếu bạn có bất kỳ câu hỏi nào, vui lòng trả lời email này hoặc liên hệ support@nude-shop.com.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
