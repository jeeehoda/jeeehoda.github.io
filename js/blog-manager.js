// Blog Manager - 포스트 관리 시스템
class BlogManager {
    constructor() {
        this.posts = [];
        this.categories = [];
        this.currentFilter = 'All';
        this.init();
    }

    async init() {
        await this.loadPosts();
        this.setupEventListeners();
        this.renderBlogPosts();
        this.renderRecentPosts();
    }

    async loadPosts() {
        try {
            const response = await fetch('./data/posts.json');
            const data = await response.json();
            this.posts = data.posts.filter(post => post.published);
            this.categories = data.categories;
        } catch (error) {
            console.error('Failed to load posts:', error);
            this.posts = [];
            this.categories = [];
        }
    }

    setupEventListeners() {
        // 필터 버튼 이벤트 리스너
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentFilter = e.target.textContent;
                this.updateActiveFilter(e.target);
                this.filterPosts();
            });
        });

        // 포스트 카드 클릭 이벤트
        document.addEventListener('click', (e) => {
            const postCard = e.target.closest('.post-card');
            if (postCard && postCard.dataset.postId) {
                this.navigateToPost(postCard.dataset.postId);
            }
        });
    }

    updateActiveFilter(activeBtn) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    filterPosts() {
        let filteredPosts = this.posts;

        if (this.currentFilter !== 'All') {
            filteredPosts = this.posts.filter(post => 
                post.category === this.currentFilter
            );
        }

        this.renderBlogPosts(filteredPosts);
    }

    renderBlogPosts(posts = this.posts) {
        const blogPostsContainer = document.querySelector('.blog-posts');
        if (!blogPostsContainer) return;

        if (posts.length === 0) {
            blogPostsContainer.innerHTML = `
                <div class="no-posts">
                    <h3>포스트가 없습니다</h3>
                    <p>해당 카테고리에 아직 포스트가 없습니다.</p>
                </div>
            `;
            return;
        }

        blogPostsContainer.innerHTML = posts.map(post => this.createPostCard(post)).join('');
    }

    renderRecentPosts() {
        const recentPostsContainer = document.querySelector('#recent-posts-grid');
        if (!recentPostsContainer) return;

        const recentPosts = this.getLatestPosts(3);
        recentPostsContainer.innerHTML = recentPosts.map(post => this.createPostCard(post)).join('');
    }

    createPostCard(post) {
        const date = new Date(post.date).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
            <article class="post-card" data-post-id="${post.id}">
                <div class="post-meta">
                    <span class="post-date">${date}</span>
                    <span class="post-category">${post.category}</span>
                    <span class="post-read-time">${post.readTime} 읽기</span>
                </div>
                <h3 class="post-title">
                    <a href="#post-${post.id}">${post.title}</a>
                </h3>
                <p class="post-excerpt">${post.excerpt}</p>
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="post-footer">
                    <span class="post-author">by ${post.author}</span>
                    <a href="#post-${post.id}" class="read-more">읽어보기 →</a>
                </div>
            </article>
        `;
    }

    navigateToPost(postId) {
        // URL 해시를 변경하여 포스트 페이지로 이동
        window.location.hash = `#post-${postId}`;
        this.showPost(postId);
    }

    showPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        // 포스트 상세 페이지 생성
        const postContent = this.createPostPage(post);
        
        // 메인 콘텐츠 영역에 포스트 페이지 표시
        const mainContent = document.querySelector('.main-content');
        const existingPostPage = document.querySelector('.post-page');
        
        if (existingPostPage) {
            existingPostPage.remove();
        }

        mainContent.insertAdjacentHTML('beforeend', postContent);
        
        // 모든 섹션 숨기기
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // 포스트 페이지 표시
        const newPostPage = document.querySelector('.post-page');
        if (newPostPage) {
            newPostPage.classList.add('active');
        }

        // 스크롤을 맨 위로
        mainContent.scrollTop = 0;
    }

    createPostPage(post) {
        const date = new Date(post.date).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
            <section class="post-page content-section active">
                <div class="post-header">
                    <nav class="breadcrumb">
                        <a href="#blog" class="breadcrumb-link">← 블로그로 돌아가기</a>
                    </nav>
                    <div class="post-meta-large">
                        <span class="post-category-large">${post.category}</span>
                        <span class="post-date-large">${date}</span>
                        <span class="post-read-time-large">${post.readTime} 읽기</span>
                    </div>
                    <h1 class="post-title-large">${post.title}</h1>
                    <p class="post-excerpt-large">${post.excerpt}</p>
                    <div class="post-tags-large">
                        ${post.tags.map(tag => `<span class="tag-large">${tag}</span>`).join('')}
                    </div>
                </div>
                
                <div class="post-image">
                    <img src="${post.image}" alt="${post.title}" />
                </div>
                
                <div class="post-content">
                    ${this.formatPostContent(post.content)}
                </div>
                
                <div class="post-footer-large">
                    <div class="author-info">
                        <div class="author-avatar">
                            <img src="https://via.placeholder.com/60x60/6C9FBF/FFFFFF?text=JH" alt="Author" />
                        </div>
                        <div class="author-details">
                            <h4>${post.author}</h4>
                            <p>개발자 & 디자이너</p>
                        </div>
                    </div>
                    <div class="post-actions">
                        <button class="share-btn" onclick="this.sharePost('${post.id}')">공유하기</button>
                        <button class="like-btn" onclick="this.likePost('${post.id}')">좋아요</button>
                    </div>
                </div>
                
                <div class="related-posts">
                    <h3>관련 포스트</h3>
                    <div class="related-posts-grid">
                        ${this.getRelatedPosts(post).map(relatedPost => 
                            `<div class="related-post-card" data-post-id="${relatedPost.id}">
                                <h4>${relatedPost.title}</h4>
                                <p>${relatedPost.excerpt}</p>
                                <span class="related-post-date">${new Date(relatedPost.date).toLocaleDateString('ko-KR')}</span>
                            </div>`
                        ).join('')}
                    </div>
                </div>
            </section>
        `;
    }

    formatPostContent(content) {
        // 간단한 마크다운 스타일 포맷팅
        return content
            .replace(/\n\n/g, '</p><p>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
    }

    getRelatedPosts(currentPost, limit = 3) {
        return this.posts
            .filter(post => 
                post.id !== currentPost.id && 
                (post.category === currentPost.category || 
                 post.tags.some(tag => currentPost.tags.includes(tag)))
            )
            .slice(0, limit);
    }

    // 포스트 검색 기능
    searchPosts(query) {
        const searchTerm = query.toLowerCase();
        return this.posts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) ||
            post.excerpt.toLowerCase().includes(searchTerm) ||
            post.content.toLowerCase().includes(searchTerm) ||
            post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }

    // 최신 포스트 가져오기
    getLatestPosts(limit = 3) {
        return this.posts
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    // 카테고리별 포스트 수 가져오기
    getPostCountByCategory() {
        const counts = {};
        this.posts.forEach(post => {
            counts[post.category] = (counts[post.category] || 0) + 1;
        });
        return counts;
    }
}

// 전역 함수들
window.sharePost = function(postId) {
    const post = blogManager.posts.find(p => p.id === postId);
    if (post && navigator.share) {
        navigator.share({
            title: post.title,
            text: post.excerpt,
            url: window.location.href
        });
    } else {
        // 클립보드에 URL 복사
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('링크가 클립보드에 복사되었습니다!');
        });
    }
};

window.likePost = function(postId) {
    // 좋아요 기능 구현 (로컬 스토리지 사용)
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    const index = likedPosts.indexOf(postId);
    
    if (index > -1) {
        likedPosts.splice(index, 1);
        alert('좋아요를 취소했습니다.');
    } else {
        likedPosts.push(postId);
        alert('좋아요를 눌렀습니다!');
    }
    
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
};

// 전역 인스턴스
let blogManager;

// DOM 로드 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    blogManager = new BlogManager();
});
