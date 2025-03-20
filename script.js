        var currentAuthor = '';
        var letterPosts = [];
        var id = 0;

        // Define the correct password directly for simplicity (hashed version of "trishas&t")
        const CORRECT_PASSWORD_HASH = "e9e7e6f4c8d9b8e8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d";

        function loadPostsFromUrl() {
            const urlParams = new URLSearchParams(window.location.search);
            const postsData = urlParams.get('posts');
            if (postsData) {
                try {
                    letterPosts = JSON.parse(decodeURIComponent(atob(postsData)));
                    id = letterPosts.length > 0 ? Math.max(...letterPosts.map(p => p.id)) + 1 : 0;
                } catch (e) {
                    console.error("Error loading posts from URL:", e);
                    letterPosts = [];
                }
            }
        }

        function updateUrlWithPosts() {
            const encodedPosts = btoa(encodeURIComponent(JSON.stringify(letterPosts)));
            const newUrl = `${window.location.pathname}?posts=${encodedPosts}`;
            window.history.replaceState(null, '', newUrl);
            document.getElementById('share-url').value = window.location.href;
        }

        function displayBlogPosts() {
            var blogPostsHtml = '';
            letterPosts.slice().reverse().forEach(function(blogPost) {
                var buttons = `
                    <button type="button" class="btn btn-primary" onclick="updateBlogPost(${blogPost.id})">
                        <i class="fa fa-edit" aria-hidden="true"></i> Update
                    </button>
                    <button type="button" class="btn btn-danger" onclick="deleteBlogPost(${blogPost.id})">
                        <i class="fa fa-trash" aria-hidden="true"></i> Delete
                    </button>
                `;
                blogPostsHtml += `
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">${blogPost.title}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">${blogPost.author}</h6>
                            <p class="card-text">${blogPost.content}</p>
                            ${buttons}
                        </div>
                    </div>
                `;
            });
            document.getElementById('blog-posts').innerHTML = blogPostsHtml;
            updateUrlWithPosts();
        }

        function updateBlogPost(blogPostId) {
            var blogPost = letterPosts.find(function(blogPost) {
                return blogPost.id === blogPostId;
            });
            if (blogPost.author === currentAuthor) {
                document.getElementById('update-id').value = blogPost.id;
                document.getElementById('update-author').value = blogPost.author;
                document.getElementById('update-title').value = blogPost.title;
                document.getElementById('update-content').value = blogPost.content;
                document.getElementById('update-content-count').innerHTML = `Characters: ${blogPost.content.length}/10000`;
                var myModal = new bootstrap.Modal(document.getElementById('updateBlogPostModal'));
                myModal.show();
            } else {
                alert('You can only update your own posts');
            }
        }

        function deleteBlogPost(blogPostId) {
            letterPosts = letterPosts.filter(function(blogPost) {
                return blogPost.id !== blogPostId;
            });
            displayBlogPosts();
        }

        function showBlogContent() {
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('main-content').style.display = 'block';
            document.querySelector('.nav-bar').style.display = 'block';
            displayBlogPosts();
        }

        $(document).ready(function() {
            // Load posts from URL on page load
            loadPostsFromUrl();

            $('#login-form').on('submit', function(e) {
                e.preventDefault();
                var passwordInput = $('#password').val();
                var enteredPasswordHash = CryptoJS.SHA256(passwordInput).toString();
                var loading = $('#loading');

                loading.addClass('show');

                setTimeout(function() {
                    if (enteredPasswordHash === CORRECT_PASSWORD_HASH) {
                        loading.removeClass('show');
                        showBlogContent();
                    } else {
                        loading.removeClass('show');
                        alert('Incorrect password! Please try again.');
                    }
                }, 1000);
            });

            document.getElementById('post-blog-post').addEventListener('click', function() {
                var title = document.getElementById('title').value;
                var content = document.getElementById('content').value;
                currentAuthor = document.getElementById('author').value;
                if (title && content && currentAuthor) {
                    var blogPost = {
                        id: id++,
                        title: title,
                        content: content,
                        author: currentAuthor
                    };
                    letterPosts.push(blogPost);
                    displayBlogPosts();
                    document.getElementById('title').value = '';
                    document.getElementById('content').value = '';
                    document.getElementById('author').value = '';
                    document.getElementById('content-count').innerHTML = 'Characters: 0/10000';
                    var myModal = bootstrap.Modal.getInstance(document.getElementById('writeBlogPostModal'));
                    myModal.hide();
                    alert('Post added! Share the updated URL with others.');
                } else {
                    alert('Please fill in all fields');
                }
            });

            document.getElementById('update-blog-post').addEventListener('click', function() {
                var blogPostId = parseInt(document.getElementById('update-id').value);
                var title = document.getElementById('update-title').value;
                var content = document.getElementById('update-content').value;
                var author = document.getElementById('update-author').value;
                if (author === currentAuthor) {
                    letterPosts = letterPosts.map(function(blogPost) {
                        if (blogPost.id === blogPostId) {
                            blogPost.title = title;
                            blogPost.content = content;
                        }
                        return blogPost;
                    });
                    displayBlogPosts();
                    var myModal = bootstrap.Modal.getInstance(document.getElementById('updateBlogPostModal'));
                    myModal.hide();
                    alert('Post updated! Share the updated URL with others.');
                } else {
                    alert('You can only update your own posts');
                }
            });

            document.getElementById('copy-url').addEventListener('click', function() {
                var shareUrl = document.getElementById('share-url');
                shareUrl.select();
                document.execCommand('copy');
                alert('URL copied to clipboard! Share it with others.');
            });

            document.getElementById('content').addEventListener('input', function() {
                var contentCount = document.getElementById('content').value.length;
                document.getElementById('content-count').innerHTML = `Characters: ${contentCount}/10000`;
            });

            document.getElementById('update-content').addEventListener('input', function() {
                var updateContentCount = document.getElementById('update-content').value.length;
                document.getElementById('update-content-count').innerHTML = `Characters: ${updateContentCount}/10000`;
            });
        });
