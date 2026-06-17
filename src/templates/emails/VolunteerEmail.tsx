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

interface VolunteerEmailProps {
  name: string;
  title: string;
  message: string;
  logoUrl?: string;
  companyName?: string;
  year?: string;
}

export default function VolunteerEmail({
  name,
  title,
  message,
  logoUrl = 'https://ik.imagekit.io/htnacim0q/media-ak-shop/setting/logo-app.png',
  companyName = 'LUNÉ',
  year = new Date().getFullYear().toString(),
}: VolunteerEmailProps) {
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
      <Preview>{title}</Preview>

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
            {/* Header / Logo Section */}
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
                  L U N É
                </Text>
              )}
              <Text className="text-accent font-playfair text-[20px] font-bold tracking-[2px] m-0 mb-1 uppercase">
                HÀNH TRÌNH YÊU THƯƠNG
              </Text>
              <Text className="text-[#999999] text-[9px] tracking-[2px] m-0 uppercase mt-1">
                Lan tỏa yêu thương cùng LUNÉ
              </Text>
            </Section>

            {/* Hero Image */}
            <Section>
              <Img
                src="https://framerusercontent.com/images/KxF8H6qGSaJvRZEhALbixoOrQg.jpg?scale-down-to=2048&width=1920&height=2400"
                alt="Volunteer Community"
                width="600"
                height="320"
                className="object-cover w-full h-[320px]"
              />
            </Section>

            {/* Content Section */}
            <Section className="py-10 px-12 text-center">
              <Text className="text-accent font-playfair text-[18px] mb-6">
                Thân gửi{' '}
                <span className="font-bold text-[#231f20]">
                  {name}
                </span>
                ,
              </Text>

              <Text className="text-[#231f20] font-playfair text-[22px] font-bold mb-6">
                {title}
              </Text>

              <Section className="text-[#555555] text-[14px] leading-[1.8] font-light text-left">
                {message.split('\n').map((paragraph, index) => (
                  <Text key={index} className="mb-4">
                    {paragraph}
                  </Text>
                ))}
              </Section>
            </Section>

            {/* Footer Section */}
            <Section className="bg-[#fcfcfc] border-t border-solid border-[#eeeeee] p-[30px] text-center">
              <Text className="text-[#999999] font-playfair text-[10px] tracking-[2px] m-0 uppercase">
                © {year} {companyName}. All rights reserved.
              </Text>
              <Text className="text-[#cccccc] text-[10px] mt-[15px] mb-0">
                <Link href="#" className="text-[#cccccc] underline">
                  Chính sách bảo mật
                </Link>
                <span className="mx-[5px]">|</span>
                <Link href="#" className="text-[#cccccc] underline">
                  Điều khoản dịch vụ
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
