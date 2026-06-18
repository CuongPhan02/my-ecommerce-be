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

interface OrderStatusEmailProps {
  order: {
    id: string;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
    totalAmountFormatted: string;
    customer: {
      name: string;
    };
  };
  companyName?: string;
  year?: string;
}

export default function OrderStatusEmail({
  order,
  companyName = 'Nude Shop',
  year = new Date().getFullYear().toString(),
}: OrderStatusEmailProps) {
  let title = 'Cập nhật trạng thái đơn hàng';
  let statusText = 'ĐANG XỬ LÝ';
  let titleColor = '#5c4e43'; // accent brown
  let mainText = `Chào ${order.customer.name}, đơn hàng #${order.id} của bạn đang được xử lý.`;
  let instruction = 'Chúng tôi sẽ tiếp tục cập nhật hành trình đơn hàng của bạn qua email này.';

  switch (order.status) {
    case 'PROCESSING':
      title = 'Đơn hàng đang được chuẩn bị';
      statusText = 'ĐANG CHUẨN BỊ HÀNG';
      titleColor = '#5c4e43';
      mainText = `Chào ${order.customer.name}, đơn hàng #${order.id} của bạn đang được chúng tôi soạn hàng và đóng gói tỉ mỉ.`;
      instruction = 'Sản phẩm sẽ sớm được bàn giao cho đơn vị vận chuyển.';
      break;
    case 'SHIPPED':
      title = 'Đơn hàng đã được gửi đi';
      statusText = 'ĐANG GIAO HÀNG';
      titleColor = '#3182ce'; // blue
      mainText = `Chào ${order.customer.name}, đơn hàng #${order.id} đã được bàn giao cho đơn vị vận chuyển và đang trên đường tới bạn!`;
      instruction = 'Vui lòng chú ý điện thoại để shipper liên hệ giao hàng.';
      break;
    case 'DELIVERED':
      title = 'Giao hàng thành công';
      statusText = 'ĐÃ GIAO HÀNG';
      titleColor = '#2e7d32'; // green
      mainText = `Chào ${order.customer.name}, đơn hàng #${order.id} của bạn đã được giao thành công!`;
      instruction = 'Cảm ơn bạn đã tin tưởng và lựa chọn sản phẩm của Nude Shop. Rất mong được phục vụ bạn ở những đơn hàng tiếp theo!';
      break;
    case 'CANCELLED':
      title = 'Đơn hàng đã bị hủy';
      statusText = 'ĐÃ HỦY';
      titleColor = '#c62828'; // red
      mainText = `Chào ${order.customer.name}, chúng tôi xác nhận đơn hàng #${order.id} của bạn đã bị hủy thành công.`;
      instruction = 'Nếu có bất kỳ nhầm lẫn nào hoặc cần hỗ trợ thêm, vui lòng liên hệ ngay với chúng tôi.';
      break;
    case 'RETURNED':
      title = 'Đơn hàng đã được hoàn trả';
      statusText = 'ĐÃ HOÀN TRẢ';
      titleColor = '#718096'; // grey
      mainText = `Chào ${order.customer.name}, đơn hàng #${order.id} của bạn đã được xử lý hoàn trả thành công về kho của Nude Shop.`;
      instruction = 'Yêu cầu hoàn trả sản phẩm của bạn đã hoàn tất.';
      break;
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
      <Preview>{title} #{order.id} - {companyName}</Preview>

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
                Hành trình đơn hàng
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

            {/* Order Status Details */}
            <Section className="py-8 px-[40px]">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '20px' }}>
                <tr style={{ borderBottom: '1px solid #eeeeee' }}>
                  <td style={{ padding: '10px 0', fontSize: '13px', color: '#666666' }}>Mã đơn hàng:</td>
                  <td style={{ padding: '10px 0', fontSize: '13px', color: '#231f20', fontWeight: 'bold', textAlign: 'right' }}>
                    #{order.id}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eeeeee' }}>
                  <td style={{ padding: '10px 0', fontSize: '13px', color: '#666666' }}>Trạng thái đơn hàng:</td>
                  <td style={{ padding: '10px 0', fontSize: '13px', color: titleColor, fontWeight: 'bold', textAlign: 'right' }}>
                    {statusText}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 0', fontSize: '14px', fontWeight: 'bold', color: '#231f20' }}>Giá trị đơn hàng:</td>
                  <td style={{ padding: '10px 0', fontSize: '16px', fontWeight: 'bold', color: '#5c4e43', textAlign: 'right' }}>
                    {order.totalAmountFormatted}
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
                Nếu bạn có bất kỳ thắc mắc nào, xin vui lòng liên hệ support@nude-shop.com.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
