import { VolunteerRepository } from './volunteer.repository';
import { CreateVolunteerType, VolunteerQueryType, SendEmailType } from './volunteer.validate';
import { BrevoProvider } from '@/provider/brevo-provider';
import { NotFoundError } from '@/utils/errors';

export class VolunteerService {
  private repo: VolunteerRepository;

  constructor(repo: VolunteerRepository) {
    this.repo = repo;
  }

  async registerVolunteer(data: CreateVolunteerType) {
    const cleanData = {
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      ...(data.message !== undefined && data.message !== null && { message: data.message }),
    };

    const volunteer = await this.repo.create(cleanData);
    if (!volunteer) {
      throw new Error('Đăng ký tình nguyện viên thất bại');
    }

    // Send thank you email to volunteer asynchronously
    BrevoProvider.sendReactMail(
      volunteer.email,
      '[LUNÉ] Xác nhận đăng ký tình nguyện viên thành công',
      'VolunteerEmail',
      {
        name: volunteer.fullName,
        title: 'Đăng ký tình nguyện viên thành công!',
        message:
          'Cảm ơn bạn đã đăng ký tham gia đội ngũ tình nguyện viên của dự án Hành Trình Yêu Thương từ LUNÉ.\n\n' +
          'Thông tin của bạn đã được lưu vào hệ thống của chúng tôi. Khi có các chương trình tình nguyện, hỗ trợ cộng đồng hoặc các chiến dịch thiện nguyện mới, ban tổ chức LUNÉ sẽ nhanh chóng liên hệ trực tiếp với bạn qua email và số điện thoại này.\n\n' +
          'Sự chung tay của bạn chính là mảnh ghép ý nghĩa giúp chúng tôi lan tỏa những điều tốt đẹp đến cộng đồng.\n\n' +
          'Trân trọng,\nBan Tổ Chức LUNÉ.',
      }
    ).catch((err) => {
      console.error(`❌ Failed to send welcome email to volunteer ${volunteer.email}:`, err);
    });

    return volunteer;
  }

  async getVolunteers(query: VolunteerQueryType) {
    const cleanQuery = {
      page: query.page,
      limit: query.limit,
      ...(query.search !== undefined && { search: query.search }),
    };
    return this.repo.getList(cleanQuery);
  }

  async deleteVolunteer(id: string) {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new NotFoundError('Không tìm thấy tình nguyện viên cần xóa');
    }
    return deleted;
  }

  async sendCustomEmail(data: SendEmailType) {
    const { volunteerIds, subject, title, message } = data;
    
    // 1. Fetch target recipients
    let recipients: Array<{ email: string; fullName: string }> = [];
    if (volunteerIds && volunteerIds.length > 0) {
      recipients = await this.repo.getByIds(volunteerIds);
    } else {
      recipients = await this.repo.getAllEmails();
    }

    if (recipients.length === 0) {
      return { sentCount: 0, message: 'Không có tình nguyện viên nào để gửi email.' };
    }

    // 2. Send emails asynchronously in the background using Promise.allSettled
    const sendPromises = recipients.map((vol) => {
      return BrevoProvider.sendReactMail(
        vol.email,
        subject,
        'VolunteerEmail',
        {
          name: vol.fullName,
          title,
          message,
        }
      ).catch((err) => {
        console.error(`❌ Error sending email to ${vol.email}:`, err);
        throw err;
      });
    });

    Promise.allSettled(sendPromises).then((results) => {
      const fulfilled = results.filter((r) => r.status === 'fulfilled').length;
      const rejected = results.filter((r) => r.status === 'rejected').length;
      console.log(`✉️ Email Broadcast Completed: ${fulfilled} succeeded, ${rejected} failed.`);
    });

    return {
      sentCount: recipients.length,
      message: `Đã kích hoạt gửi email cho ${recipients.length} tình nguyện viên.`,
    };
  }
}
