// Post Editor - 포스트 관리 도구
class PostEditor {
    constructor() {
        this.posts = [];
        this.init();
    }

    async init() {
        await this.loadPosts();
        this.setupEditor();
    }

    async loadPosts() {
        try {
            const response = await fetch('./data/posts.json');
            const data = await response.json();
            this.posts = data.posts;
        } catch (error) {
            console.error('Failed to load posts:', error);
            this.posts = [];
        }
    }

    setupEditor() {
        // 편집기 UI가 필요한 경우에만 생성
        if (window.location.hash === '#admin') {
            this.createEditorUI();
        }
    }

    createEditorUI() {
        const editorHTML = `
            <div class="post-editor" id="post-editor">
                <div class="editor-header">
                    <h2>포스트 관리</h2>
                    <button class="new-post-btn" onclick="postEditor.showNewPostForm()">새 포스트 작성</button>
                </div>
                
                <div class="posts-list">
                    <h3>기존 포스트</h3>
                    <div class="posts-table">
                        <div class="table-header">
                            <div>제목</div>
                            <div>카테고리</div>
                            <div>날짜</div>
                            <div>상태</div>
                            <div>액션</div>
                        </div>
                        ${this.createPostsTable()}
                    </div>
                </div>

                <div class="post-form" id="post-form" style="display: none;">
                    <h3 id="form-title">새 포스트 작성</h3>
                    <form id="post-form-element">
                        <input type="hidden" id="post-id" name="id">
                        
                        <div class="form-group">
                            <label for="post-title">제목</label>
                            <input type="text" id="post-title" name="title" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="post-excerpt">요약</label>
                            <textarea id="post-excerpt" name="excerpt" rows="3" required></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="post-content">내용</label>
                            <textarea id="post-content" name="content" rows="10" required></textarea>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="post-category">카테고리</label>
                                <select id="post-category" name="category" required>
                                    <option value="Development">Development</option>
                                    <option value="Design">Design</option>
                                    <option value="Technology">Technology</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="post-date">날짜</label>
                                <input type="date" id="post-date" name="date" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="post-tags">태그 (쉼표로 구분)</label>
                            <input type="text" id="post-tags" name="tags" placeholder="React, TypeScript, Web Development">
                        </div>
                        
                        <div class="form-group">
                            <label for="post-image">이미지 URL</label>
                            <input type="url" id="post-image" name="image" placeholder="https://example.com/image.jpg">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="post-read-time">읽기 시간</label>
                                <input type="text" id="post-read-time" name="readTime" placeholder="5분" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="post-author">작성자</label>
                                <input type="text" id="post-author" name="author" value="jeeho" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="post-featured" name="featured">
                                추천 포스트로 설정
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="post-published" name="published" checked>
                                발행
                            </label>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="save-btn">저장</button>
                            <button type="button" class="cancel-btn" onclick="postEditor.hideForm()">취소</button>
                            <button type="button" class="delete-btn" id="delete-btn" onclick="postEditor.deletePost()" style="display: none;">삭제</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // 메인 콘텐츠에 편집기 추가
        const mainContent = document.querySelector('.main-content');
        mainContent.insertAdjacentHTML('beforeend', editorHTML);

        // 폼 이벤트 리스너 설정
        document.getElementById('post-form-element').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePost();
        });
    }

    createPostsTable() {
        return this.posts.map(post => `
            <div class="table-row">
                <div class="post-title-cell">${post.title}</div>
                <div class="post-category-cell">${post.category}</div>
                <div class="post-date-cell">${post.date}</div>
                <div class="post-status-cell">
                    <span class="status-badge ${post.published ? 'published' : 'draft'}">
                        ${post.published ? '발행됨' : '임시저장'}
                    </span>
                </div>
                <div class="post-actions-cell">
                    <button onclick="postEditor.editPost('${post.id}')" class="edit-btn">편집</button>
                    <button onclick="postEditor.deletePost('${post.id}')" class="delete-btn">삭제</button>
                </div>
            </div>
        `).join('');
    }

    showNewPostForm() {
        const form = document.getElementById('post-form');
        const formTitle = document.getElementById('form-title');
        const deleteBtn = document.getElementById('delete-btn');
        
        formTitle.textContent = '새 포스트 작성';
        deleteBtn.style.display = 'none';
        
        // 폼 초기화
        document.getElementById('post-form-element').reset();
        document.getElementById('post-date').value = new Date().toISOString().split('T')[0];
        
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    }

    editPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const form = document.getElementById('post-form');
        const formTitle = document.getElementById('form-title');
        const deleteBtn = document.getElementById('delete-btn');
        
        formTitle.textContent = '포스트 편집';
        deleteBtn.style.display = 'inline-block';
        deleteBtn.dataset.postId = postId;
        
        // 폼에 포스트 데이터 채우기
        document.getElementById('post-id').value = post.id;
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-excerpt').value = post.excerpt;
        document.getElementById('post-content').value = post.content;
        document.getElementById('post-category').value = post.category;
        document.getElementById('post-date').value = post.date;
        document.getElementById('post-tags').value = post.tags.join(', ');
        document.getElementById('post-image').value = post.image || '';
        document.getElementById('post-read-time').value = post.readTime;
        document.getElementById('post-author').value = post.author;
        document.getElementById('post-featured').checked = post.featured || false;
        document.getElementById('post-published').checked = post.published;
        
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    }

    hideForm() {
        document.getElementById('post-form').style.display = 'none';
    }

    savePost() {
        const formData = new FormData(document.getElementById('post-form-element'));
        const postData = {
            id: formData.get('id') || this.generateId(),
            title: formData.get('title'),
            excerpt: formData.get('excerpt'),
            content: formData.get('content'),
            category: formData.get('category'),
            date: formData.get('date'),
            tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag),
            image: formData.get('image') || `https://via.placeholder.com/800x400/6C9FBF/FFFFFF?text=${encodeURIComponent(formData.get('title'))}`,
            readTime: formData.get('readTime'),
            author: formData.get('author'),
            featured: formData.get('featured') === 'on',
            published: formData.get('published') === 'on'
        };

        // 기존 포스트인지 확인
        const existingIndex = this.posts.findIndex(p => p.id === postData.id);
        
        if (existingIndex > -1) {
            // 기존 포스트 업데이트
            this.posts[existingIndex] = postData;
        } else {
            // 새 포스트 추가
            this.posts.push(postData);
        }

        // JSON 파일 업데이트 (실제 환경에서는 서버 API를 사용해야 함)
        this.updatePostsFile();
        
        // UI 업데이트
        this.updatePostsTable();
        this.hideForm();
        
        alert('포스트가 저장되었습니다!');
    }

    deletePost(postId) {
        if (!postId) {
            // 현재 편집 중인 포스트 삭제
            const currentPostId = document.getElementById('post-id').value;
            if (!currentPostId) return;
            postId = currentPostId;
        }

        if (confirm('정말로 이 포스트를 삭제하시겠습니까?')) {
            this.posts = this.posts.filter(p => p.id !== postId);
            this.updatePostsFile();
            this.updatePostsTable();
            this.hideForm();
            alert('포스트가 삭제되었습니다.');
        }
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    updatePostsFile() {
        // 실제 환경에서는 서버 API를 통해 파일을 업데이트해야 합니다
        // 여기서는 로컬 스토리지에 저장
        localStorage.setItem('blogPosts', JSON.stringify(this.posts));
        console.log('Posts updated:', this.posts);
    }

    updatePostsTable() {
        const tableContainer = document.querySelector('.posts-table .table-header');
        if (tableContainer) {
            tableContainer.innerHTML = `
                <div>제목</div>
                <div>카테고리</div>
                <div>날짜</div>
                <div>상태</div>
                <div>액션</div>
            ` + this.createPostsTable();
        }
    }
}

// 전역 인스턴스
let postEditor;

// DOM 로드 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    postEditor = new PostEditor();
});
