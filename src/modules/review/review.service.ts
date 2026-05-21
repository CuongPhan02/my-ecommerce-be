import { ReviewRepository } from './review.repository';
import { 
  ReviewQueryType, 
  CreateReviewBodyType, 
  ModerateReviewBodyType, 
  AdminReplyBodyType 
} from './review.validate';
import { NotFoundError, BadRequestError } from '@/utils/errors';

export class ReviewService {
  private repo: ReviewRepository;

  constructor(repo: ReviewRepository) {
    this.repo = repo;
  }

  async createReview(userId: string, data: CreateReviewBodyType) {
    // 1. Check if user has purchased the product/variant
    const hasPurchased = await this.repo.hasUserPurchasedProduct(
      userId,
      data.productId,
      data.productVariantId
    );

    if (!hasPurchased) {
      throw new BadRequestError('Bạn chỉ có thể đánh giá sản phẩm sau khi đã nhận được hàng.');
    }

    // 2. Check if user has already reviewed this product/variant
    const hasReviewed = await this.repo.hasUserReviewedProduct(
      userId,
      data.productId,
      data.productVariantId
    );

    if (hasReviewed) {
      throw new BadRequestError('Bạn đã gửi đánh giá cho sản phẩm này rồi.');
    }

    return this.repo.create({
      productId: data.productId,
      productVariantId: data.productVariantId,
      userId,
      rating: data.rating,
      content: data.content,
      tags: data.tags,
    });
  }

  async getApprovedReviews(productId: string, query: { page: number; limit: number }) {
    return this.repo.findApprovedByProductId(productId, query);
  }

  async getAllReviews(query: ReviewQueryType) {
    return this.repo.findAll(query);
  }

  async getReviewById(id: string) {
    const review = await this.repo.findById(id);
    if (!review) {
      throw new NotFoundError('Đánh giá không tồn tại.');
    }
    return review;
  }

  async moderateReview(id: string, data: ModerateReviewBodyType) {
    await this.getReviewById(id);
    return this.repo.updateReview(id, { status: data.status });
  }

  async adminReply(id: string, userId: string, data: AdminReplyBodyType) {
    await this.getReviewById(id);
    return this.repo.updateReview(id, {
      adminReply: data.content,
      adminReplyAt: new Date(),
      adminReplyBy: userId,
    });
  }

  async deleteReview(id: string) {
    await this.getReviewById(id);
    return this.repo.delete(id);
  }
}
