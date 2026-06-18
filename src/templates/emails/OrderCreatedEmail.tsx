import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Img,
  Link,
  Section,
  Font,
  Tailwind,
} from '@react-email/components';

interface OrderCreatedEmailProps {
  order: {
    id: string;
    totalAmount: number;
    totalAmountFormatted: string;
    discountAmount: number;
    discountAmountFormatted: string;
    createdAt: Date | string;
    customer: {
      name: string;
      email: string;
      phone: string | null;
    };
    shippingAddress: {
      street: string;
      city: string;
      province: string;
      postalCode: string;
      country: string;
    };
    payment: {
      method: string;
      status: string;
      amountFormatted: string;
    } | null;
    items: Array<{
      id: string;
      quantity: number;
      priceAtPurchase: number;
      priceAtPurchaseFormatted: string;
      variant?: {
        sku: string;
      } | null;
      product: {
        name: string;
        thumbnail?: {
          url: string;
        } | null;
      };
    }>;
  };
  companyName?: string;
  year?: string;
}

export default function OrderCreatedEmail({
  order,
  companyName = 'Nude Shop',
  year = new Date().getFullYear().toString(),
}: OrderCreatedEmailProps) {
  const formattedDate = new Date(order.createdAt).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

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
      <Preview>Xác nhận đơn hàng #{order.id} - {companyName}</Preview>

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
                Cảm ơn bạn đã mua sắm
              </Text>
            </Section>

            {/* Title Section */}
            <Section className="py-6 px-[40px] text-center bg-[#fcfcfc] border-y border-solid border-[#eeeeee]">
              <Text className="text-[#231f20] font-playfair text-[20px] font-bold m-0 mb-2">
                ĐẶT HÀNG THÀNH CÔNG!
              </Text>
              <Text className="text-[#666666] text-[14px] m-0">
                Chào <strong>{order.customer.name}</strong>, đơn hàng <strong>#{order.id}</strong> của bạn đã được tiếp nhận và đang chờ xử lý.
              </Text>
            </Section>

            {/* Order Info & Shipping */}
            <Section className="py-6 px-[40px]">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tr>
                  <td style={{ width: '50%', verticalAlign: 'top', paddingRight: '10px' }}>
                    <Text className="text-accent text-[12px] font-bold uppercase tracking-[1px] m-0 mb-2">Thông tin đơn hàng</Text>
                    <Text className="text-[#444444] text-[13px] m-0 mb-1">Ngày đặt: {formattedDate}</Text>
                    <Text className="text-[#444444] text-[13px] m-0 mb-1">Thanh toán: {order.payment?.method || 'COD'}</Text>
                    <Text className="text-[#444444] text-[13px] m-0">Trạng thái: Chờ xác nhận</Text>
                  </td>
                  <td style={{ width: '50%', verticalAlign: 'top', paddingLeft: '10px' }}>
                    <Text className="text-accent text-[12px] font-bold uppercase tracking-[1px] m-0 mb-2">Địa chỉ giao hàng</Text>
                    <Text className="text-[#444444] text-[13px] m-0 mb-1">Người nhận: {order.customer.name}</Text>
                    <Text className="text-[#444444] text-[13px] m-0 mb-1">SĐT: {order.customer.phone || 'N/A'}</Text>
                    <Text className="text-[#444444] text-[13px] m-0">Địa chỉ: {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.province}</Text>
                  </td>
                </tr>
              </table>
            </Section>

            {/* Order Items Table */}
            <Section className="px-[40px] pb-6">
              <Text className="text-accent text-[12px] font-bold uppercase tracking-[1px] m-0 mb-3">Chi tiết sản phẩm</Text>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #231f20' }}>
                    <th style={{ textAlign: 'left', paddingBottom: '8px', fontSize: '12px', textTransform: 'uppercase', color: '#999999' }}>Sản phẩm</th>
                    <th style={{ textAlign: 'center', paddingBottom: '8px', fontSize: '12px', textTransform: 'uppercase', color: '#999999', width: '60px' }}>SL</th>
                    <th style={{ textAlign: 'right', paddingBottom: '8px', fontSize: '12px', textTransform: 'uppercase', color: '#999999', width: '100px' }}>Đơn giá</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #eeeeee' }}>
                      <td style={{ padding: '12px 0' }}>
                        <table style={{ borderCollapse: 'collapse' }}>
                          <tr>
                            {item.product.thumbnail?.url && (
                              <td style={{ paddingRight: '10px' }}>
                                <Img
                                  src={item.product.thumbnail.url}
                                  alt={item.product.name}
                                  width="50"
                                  height="50"
                                  className="object-cover rounded"
                                />
                              </td>
                            )}
                            <td>
                              <Text className="text-[#231f20] text-[13px] font-bold m-0">{item.product.name}</Text>
                              {item.variant?.sku && (
                                <Text className="text-[#999999] text-[11px] m-0">SKU: {item.variant.sku}</Text>
                              )}
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td style={{ textAlign: 'center', fontSize: '13px', color: '#444444' }}>
                        {item.quantity}
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '13px', color: '#231f20', fontWeight: 'bold' }}>
                        {item.priceAtPurchaseFormatted}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            {/* Order Summary */}
            <Section className="px-[40px] pb-8">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                {order.discountAmount > 0 && (
                  <tr>
                    <td style={{ textAlign: 'left', padding: '4px 0', fontSize: '13px', color: '#666666' }}>Giảm giá:</td>
                    <td style={{ textAlign: 'right', padding: '4px 0', fontSize: '13px', color: '#e53e3e', fontWeight: 'bold' }}>
                      -{order.discountAmountFormatted}
                    </td>
                  </tr>
                )}
                <tr style={{ borderTop: '2px solid #eeeeee' }}>
                  <td style={{ textAlign: 'left', paddingTop: '10px', fontSize: '15px', fontWeight: 'bold', color: '#231f20' }}>
                    TỔNG TIỀN THANH TOÁN:
                  </td>
                  <td style={{ textAlign: 'right', paddingTop: '10px', fontSize: '18px', fontWeight: 'bold', color: '#5c4e43' }}>
                    {order.totalAmountFormatted}
                  </td>
                </tr>
              </table>
            </Section>

            {/* Footer */}
            <Section className="bg-[#fcfcfc] border-t border-solid border-[#eeeeee] p-[30px] text-center">
              <Text className="text-[#999999] font-playfair text-[10px] tracking-[2px] m-0 uppercase">
                © {year} {companyName}. All rights reserved.
              </Text>
              <Text className="text-[#bbbbbb] text-[10px] mt-3 mb-0">
                Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua email support@nude-shop.com.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
