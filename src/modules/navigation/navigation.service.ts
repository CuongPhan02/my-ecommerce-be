import {
  CreateNavigationDTO,
  NavigationRepository,
  UpdateNavigationDTO,
} from './navigation.repository';

export const SYSTEM_MENUS: CreateNavigationDTO[] = [
  {
    type: 'MAIN_LINK',
    label: 'Trang chủ',
    href: '/',
    displayOrder: 1,
    isSystem: true,
    isMegaMenu: false,
    isActive: true,
  },
  {
    type: 'MAIN_LINK',
    label: 'Cửa hàng',
    href: '/shop',
    displayOrder: 2,
    isSystem: true,
    isMegaMenu: true,
    isActive: true,
  },
  {
    type: 'MAIN_LINK',
    label: 'Giới thiệu',
    href: '/about',
    displayOrder: 3,
    isSystem: true,
    isMegaMenu: false,
    isActive: true,
  },
  {
    type: 'MAIN_LINK',
    label: 'Liên hệ',
    href: '/contact',
    displayOrder: 4,
    isSystem: true,
    isMegaMenu: false,
    isActive: true,
  },
];

export class NavigationService {
  private repo: NavigationRepository;

  constructor(repo: NavigationRepository) {
    this.repo = repo;
  }

  async initSystemNavigations() {
    return await this.repo.initSystemNavigations(SYSTEM_MENUS);
  }

  async getMegaMenuData() {
    return await this.repo.getMegaMenuData();
  }

  async createNavigation(data: CreateNavigationDTO & { megaMenu?: any }) {
    return await this.repo.create(data);
  }

  async getAllNavigations() {
    return await this.repo.getAll();
  }

  async getNavigationTree() {
    return await this.repo.getTree();
  }

  async getNavigationById(id: string) {
    const nav = await this.repo.getById(id);
    if (!nav) throw new Error('Không tìm thấy menu điều hướng');
    return nav;
  }

  async updateNavigation(id: string, data: UpdateNavigationDTO & { megaMenu?: any }) {
    const nav = await this.repo.getById(id);
    if (!nav) throw new Error('Không tìm thấy menu điều hướng');

    return await this.repo.update(id, data);
  }

  async deleteNavigation(id: string) {
    const nav = await this.repo.getById(id);
    if (!nav) throw new Error('Không tìm thấy menu điều hướng');
    if (nav.isSystem) throw new Error('Không thể xóa menu điều hướng hệ thống');

    return await this.repo.delete(id);
  }
}
