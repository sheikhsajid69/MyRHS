     var currentAuthor = '';
        var letterPosts = [];
        var id = 0;

        function getPasswordHash() {
            const p1 = String.fromCharCode(116, 114, 105); //
            const p2 = String.fromCharCode(115, 104, 97);  // 
            const p3 = String.fromCharCode(115);           // 
            const p4 = String.fromCharCode(38);            // 
            const p5 = String.fromCharCode(116);           // 
            const combined = [p1, p2, p3, p4, p5].join('');
            return CryptoJS.SHA256(combined).toString();
        }

        // Load posts from URL parameter
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

        // Save posts to URL
        function updateUrlWithPosts() {
            const encodedPosts = btoa(encodeURIComponent(JSON.stringify(letterPosts)));
            const newUrl = `${window.location.pathname}?posts=${encodedPosts}`;
            window.history.replaceState(null, '', newUrl);
            document.getElementById('share-url').value = window.location.href;
        }

        // Blog functions
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

        $(document).ready(function() {
            var loginForm = $("#login-form");
            var passwordInput = $("#password");
            var loading = $("#loading");
            var blogContent = $("#main-content");
            var loginContainer = $("#login-container");
            var navBar = $(".nav-bar");

            navBar.hide();

            // Load posts from URL on page load
            loadPostsFromUrl();
            if (letterPosts.length > 0) {
                displayBlogPosts();
            }

            // Login form submission
            loginForm.submit(function(e) {
                e.preventDefault();
                var enteredPassword = CryptoJS.SHA256(passwordInput.val()).toString();
                var correctPassword = getPasswordHash();
                loading.addClass("show");
                
                setTimeout(function() {
                    if (enteredPassword === correctPassword) {
                        loading.removeClass("show");
                        showBlogContent();
                    } else {
                        loading.removeClass("show");
                        alert("Incorrect password!");
                    }
                }, 1000);
            });

            function showBlogContent() {
                loginContainer.hide();
                navBar.show();
                blogContent.show();
                displayBlogPosts();
            }

            // Post blog event listener
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

            // Update blog event listener
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

            // Copy URL button
            document.getElementById('copy-url').addEventListener('click', function() {
                var shareUrl = document.getElementById('share-url');
                shareUrl.select();
                document.execCommand('copy');
                alert('URL copied to clipboard! Share it with others.');
            });

            // Character count listeners
            document.getElementById('content').addEventListener('input', function() {
                var contentCount = document.getElementById('content').value.length;
                document.getElementById('content-count').innerHTML = `Characters: ${contentCount}/10000`;
            });

            document.getElementById('update-content').addEventListener('input', function() {
                var updateContentCount = document.getElementById('update-content').value.length;
                document.getElementById('update-content-count').innerHTML = `Characters: ${updateContentCount}/10000`;
            });
        });
