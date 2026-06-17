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
  Hr,
  Row,
  Column,
} from '@react-email/components';

interface OrderItem {
  name: string;
  quantity: number;
  price: string;
}

interface OrderConfirmationEmailProps {
  orderId: string;
  name: string;
  totalAmount: string;
  shippingAddress: string;
  items: OrderItem[];
  logoUrl?: string;
  companyName?: string;
  year?: string;
}

export default function OrderConfirmationEmail({
  orderId = '#12345',
  name = 'Customer',
  totalAmount = '0 đ',
  shippingAddress = '',
  items = [],
  logoUrl = 'https://ik.imagekit.io/htnacim0q/media-ak-shop/setting/logo-app.png',
  companyName = 'LUNÉ',
  year = new Date().getFullYear().toString(),
}: OrderConfirmationEmailProps) {
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
      <Preview>Xác nhận đơn hàng #{orderId}</Preview>

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
            <Section className="pt-10 px-10 pb-5 text-center">
              {logoUrl && !logoUrl.includes('htnacim0q') ? (
                <Img
                  src={logoUrl}
                  alt="Logo"
                  width="80"
                  height="80"
                  className="rounded-full mx-auto mb-5 block"
                />
              ) : (
                <Text className="font-playfair text-[32px] font-bold text-[#231f20] tracking-[0.25em] m-0 mb-5 text-center">
                  {companyName}
                </Text>
              )}
              <Text className="text-accent font-playfair text-[24px] italic font-medium m-0 mb-1">
                Xác nhận đơn hàng
              </Text>
              <Text className="text-[#999999] text-[10px] tracking-[3px] m-0 uppercase mt-1">
                Cảm ơn bạn đã mua sắm
              </Text>
            </Section>

            <Section className="py-5 px-[60px]">
              <Text className="text-accent font-playfair text-[18px] mb-6">
                Xin chào{' '}
                <span className="border-b border-solid border-[#cccccc] font-bold pb-0.5 text-[#231f20]">
                  {name}
                </span>
                ,
              </Text>

              <Text className="text-[#666666] text-[14px] font-light leading-[1.6]">
                Chúng tôi đã nhận được đơn hàng <strong>#{orderId}</strong> của bạn. Một email xác nhận chi tiết sẽ được gửi tới hòm thư của bạn khi đơn hàng được giao cho đơn vị vận chuyển.
              </Text>

              <Hr className="border-[#eeeeee] my-6" />

              <Text className="font-bold text-[#231f20] uppercase text-[12px] tracking-[1px] mb-4">
                Chi tiết đơn hàng
              </Text>

              {items.map((item, index) => (
                <Row key={index} className="mb-4">
                  <Column className="w-3/4">
                    <Text className="text-[#231f20] font-bold m-0 text-[14px]">
                      {item.name}
                    </Text>
                    <Text className="text-[#999999] m-0 text-[12px]">
                      Số lượng: {item.quantity}
                    </Text>
                  </Column>
                  <Column className="w-1/4 text-right align-top">
                    <Text className="text-[#231f20] font-bold m-0 text-[14px]">
                      {item.price}
                    </Text>
                  </Column>
                </Row>
              ))}

              <Hr className="border-[#eeeeee] my-6" />

              <Row>
                <Column className="w-1/2">
                  <Text className="text-[#999999] text-[12px] m-0">Tổng thanh toán</Text>
                </Column>
                <Column className="w-1/2 text-right">
                  <Text className="text-[#231f20] font-bold text-[18px] m-0">
                    {totalAmount}
                  </Text>
                </Column>
              </Row>

              <Hr className="border-[#eeeeee] my-6" />

              <Text className="font-bold text-[#231f20] uppercase text-[12px] tracking-[1px] mb-2">
                Thông tin vận chuyển
              </Text>
              <Text className="text-[#666666] text-[14px] leading-[1.6] m-0">
                {shippingAddress}
              </Text>

              <Section className="mt-10 mb-[30px] text-center">
                <Link
                  href={`https://my-ecommerce-fe.vercel.app/shop`}
                  className="bg-brand text-white inline-block font-playfair text-[14px] font-bold tracking-[2px] py-[15px] px-10 no-underline uppercase"
                  style={{ backgroundColor: '#231f20' }}
                >
                  Tiếp tục mua sắm
                </Link>
              </Section>
            </Section>

            <Section className="bg-[#fcfcfc] border-t border-solid border-[#eeeeee] p-[30px] text-center">
              <Text className="text-[#999999] font-playfair text-[10px] tracking-[2px] m-0 uppercase">
                © {year} {companyName}. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
