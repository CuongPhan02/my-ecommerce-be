import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Section,
  Link,
  Font,
  Tailwind,
} from '@react-email/components';

interface PaymentFailedEmailProps {
  order: {
    id: string;
    totalAmountFormatted: string;
    customer: {
      name: string;
    };
    payment: {
      method: string;
    } | null;
  };
  repayUrl?: string;
  companyName?: string;
  year?: string;
}

export default function PaymentFailedEmail({
  order,
  repayUrl,
  companyName = 'Nude Shop',
  year = new Date().getFullYear().toString(),
}: PaymentFailedEmailProps) {
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
      <Preview>Thanh toán không thành công đơn hàng #{order.id} - {companyName}</Preview>

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
                Giao dịch thất bại
              </Text>
            </Section>

            {/* Title Section */}
            <Section className="py-6 px-[40px] text-center bg-[#fcfcfc] border-y border-solid border-[#eeeeee]">
              <Text className="text-[#c62828] font-playfair text-[20px] font-bold m-0 mb-2">
                THANH TOÁN THẤT BẠI
              </Text>
              <Text className="text-[#666666] text-[14px] m-0">
                Chào <strong>{order.customer.name}</strong>, giao dịch thanh toán cho đơn hàng <strong>#{order.id}</strong> không thành công hoặc đã bị hủy.
              </Text>
            </Section>

            {/* Payment Details */}
            <Section className="py-8 px-[40px] text-center">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '30px' }}>
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
                <tr>
                  <td style={{ padding: '10px 0', fontSize: '14px', fontWeight: 'bold', color: '#231f20' }}>Số tiền cần thanh toán:</td>
                  <td style={{ padding: '10px 0', fontSize: '16px', fontWeight: 'bold', color: '#5c4e43', textAlign: 'right' }}>
                    {order.totalAmountFormatted}
                  </td>
                </tr>
              </table>

              <Text className="text-[#666666] text-[13px] leading-[1.6] text-left mb-6">
                Rất tiếc, quá trình xử lý giao dịch qua cổng thanh toán đã xảy ra lỗi hoặc bị gián đoạn. Do đó, đơn hàng của bạn đã tạm thời chuyển sang trạng thái <strong>Đã hủy (Cancelled)</strong>.
              </Text>

              {repayUrl && (
                <Section className="my-6">
                  <Link
                    href={repayUrl}
                    className="bg-brand text-white inline-block font-playfair text-[14px] font-bold tracking-[2px] py-3.5 px-8 no-underline uppercase"
                    style={{ backgroundColor: '#231f20' }}
                  >
                    Thử thanh toán lại
                  </Link>
                </Section>
              )}
            </Section>

            {/* Footer */}
            <Section className="bg-[#fcfcfc] border-t border-solid border-[#eeeeee] p-[30px] text-center">
              <Text className="text-[#999999] font-playfair text-[10px] tracking-[2px] m-0 uppercase">
                © {year} {companyName}. All rights reserved.
              </Text>
              <Text className="text-[#bbbbbb] text-[10px] mt-3 mb-0">
                Nếu bạn gặp khó khăn trong quá trình thanh toán, vui lòng liên hệ support@nude-shop.com để được hỗ trợ tốt nhất.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
