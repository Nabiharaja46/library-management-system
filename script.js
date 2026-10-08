const defaultBooks = [
    { id: '1', title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', category: 'Technology', copies: 5, available: 4 },
    { id: '2', title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '978-0061120084', category: 'Fiction', copies: 3, available: 2 },
    { id: '3', title: 'Sapiens: A Brief History', author: 'Yuval Noah Harari', isbn: '978-0062316097', category: 'History', copies: 4, available: 4 }
];

const defaultMembers = [
    { id: 'M-101', name: 'Nabiha Raja', email: 'nabiha.raja@example.com', phone: '+92 300 1234567' },
    { id: 'M-102', name: 'Shawana', email: 'shawana@example.com', phone: '+92 301 7654321' },
    { id: 'M-103', name: 'Laiba', email: 'laiba@example.com', phone: '+92 302 9876543' }
];

const defaultTransactions = [
    { id: 'T-101', memberId: 'M-101', memberName: 'Nabiha Raja', bookId: '1', bookTitle: 'Clean Code', issueDate: '2026-10-01', dueDate: '2026-10-15', status: 'Issued' },
    { id: 'T-102', memberId: 'M-102', memberName: 'Shawana', bookId: '2', bookTitle: 'To Kill a Mockingbird', issueDate: '2026-09-20', dueDate: '2026-10-20', status: 'Issued' }
];

let books = JSON.parse(localStorage.getItem('lib_books')) || defaultBooks;
let members = JSON.parse(localStorage.getItem('lib_members')) || defaultMembers;
let transactions = JSON.parse(localStorage.getItem('lib_transactions')) || defaultTransactions;

function saveData() {
    localStorage.setItem('lib_books', JSON.stringify(books));
    localStorage.setItem('lib_members', JSON.stringify(members));
    localStorage.setItem('lib_transactions', JSON.stringify(transactions));
    updateDashboardStats();
}

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    renderBooksTable();
    renderMembersTable();
    renderIssuedTable();
    populateSelectDropdowns();
    updateDashboardStats();

    const bookForm = document.querySelector('#books form');
    if (bookForm) bookForm.addEventListener('submit', handleAddBook);

    const issueForm = document.querySelector('#issue-return form');
    if (issueForm) issueForm.addEventListener('submit', handleIssueBook);

    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => filterBooks(e.target.value));
    }
});

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('href').replace('#', '');

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            sections.forEach(sec => {
                sec.style.display = sec.id === targetId ? 'block' : 'none';
            });

            const titleElement = document.querySelector('.header-title h1');
            const titles = {
                'dashboard': 'Dashboard Overview',
                'books': 'Book Inventory Management',
                'issue-return': 'Issue & Return Portal',
                'members': 'Registered Members Directory'
            };
            if (titleElement) titleElement.innerText = titles[targetId] || 'Dashboard Overview';
        });
    });

    sections.forEach(sec => sec.style.display = sec.id === 'dashboard' ? 'block' : 'none');
}

function updateDashboardStats() {
    const totalBooks = books.reduce((acc, b) => acc + parseInt(b.copies), 0);
    const activeIssued = transactions.filter(t => t.status === 'Issued').length;
    const totalMembers = members.length;
    
    const today = new Date().toISOString().split('T')[0];
    const overdue = transactions.filter(t => t.status === 'Issued' && t.dueDate < today).length;

    const statsValues = document.querySelectorAll('.stat-details .value');
    if (statsValues.length >= 4) {
        statsValues[0].innerText = totalBooks;
        statsValues[1].innerText = activeIssued;
        statsValues[2].innerText = totalMembers;
        statsValues[3].innerText = overdue;
    }
}

function renderBooksTable(data = books) {
    const tbody = document.querySelector('#books table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    data.forEach(book => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="table-title">${book.title}</div>
                <div class="table-sub">${book.author} • ${book.isbn}</div>
            </td>
            <td><span class="chip">${book.category}</span></td>
            <td>${book.copies} Copies</td>
            <td>
                <span class="status-pill ${book.available > 0 ? 'status-available' : 'badge-danger'}">
                    ${book.available} Available
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="icon-btn btn-delete" onclick="deleteBook('${book.id}')">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function handleAddBook(e) {
    e.preventDefault();

    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim();
    const isbn = document.getElementById('book-isbn').value.trim();
    const category = document.getElementById('book-category').value;
    const copies = parseInt(document.getElementById('book-copies').value);

    if (!title || !author || !isbn) return;

    const newBook = {
        id: Date.now().toString(),
        title,
        author,
        isbn,
        category,
        copies,
        available: copies
    };

    books.push(newBook);
    saveData();
    renderBooksTable();
    populateSelectDropdowns();

    e.target.reset();
}

function deleteBook(id) {
    if (confirm('Are you sure you want to remove this book?')) {
        books = books.filter(b => b.id !== id);
        saveData();
        renderBooksTable();
        populateSelectDropdowns();
    }
}

function filterBooks(query) {
    const filtered = books.filter(b => 
        b.title.toLowerCase().includes(query.toLowerCase()) ||
        b.author.toLowerCase().includes(query.toLowerCase()) ||
        b.isbn.includes(query)
    );
    renderBooksTable(filtered);
}

function populateSelectDropdowns() {
    const memberSelect = document.getElementById('member-select');
    const bookSelect = document.getElementById('book-select');

    if (memberSelect) {
        memberSelect.innerHTML = '<option value="">Choose Member...</option>' + 
            members.map(m => `<option value="${m.id}">${m.name} (${m.id})</option>`).join('');
    }

    if (bookSelect) {
        bookSelect.innerHTML = '<option value="">Choose Book...</option>' + 
            books.filter(b => b.available > 0)
                 .map(b => `<option value="${b.id}">${b.title} (${b.available} Available)</option>`).join('');
    }
}

function renderIssuedTable() {
    const tbody = document.querySelector('#issue-return table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const activeTransactions = transactions.filter(t => t.status === 'Issued');

    activeTransactions.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="table-title">${t.memberName}</div>
                <div class="table-sub">ID: ${t.memberId}</div>
            </td>
            <td>${t.bookTitle}</td>
            <td><span class="date-tag">${t.dueDate}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-success" onclick="returnBook('${t.id}')">Return</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function handleIssueBook(e) {
    e.preventDefault();

    const memberId = document.getElementById('member-select').value;
    const bookId = document.getElementById('book-select').value;
    const dueDate = document.getElementById('due-date').value;

    if (!memberId || !bookId || !dueDate) return;

    const member = members.find(m => m.id === memberId);
    const book = books.find(b => b.id === bookId);

    if (!book || book.available <= 0) return;

    book.available -= 1;

    const newTransaction = {
        id: `T-${Date.now()}`,
        memberId: member.id,
        memberName: member.name,
        bookId: book.id,
        bookTitle: book.title,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: dueDate,
        status: 'Issued'
    };

    transactions.push(newTransaction);
    saveData();

    renderBooksTable();
    renderIssuedTable();
    populateSelectDropdowns();

    e.target.reset();
}

function returnBook(transactionId) {
    const tx = transactions.find(t => t.id === transactionId);
    if (!tx) return;

    tx.status = 'Returned';

    const book = books.find(b => b.id === tx.bookId);
    if (book) {
        book.available += 1;
    }

    saveData();
    renderBooksTable();
    renderIssuedTable();
    populateSelectDropdowns();
}

function renderMembersTable() {
    const tbody = document.querySelector('#members table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    members.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="id-badge">${m.id}</span></td>
            <td><strong>${m.name}</strong></td>
            <td>${m.email}</td>
            <td>${m.phone}</td>
            <td>
                <button class="icon-btn btn-delete" onclick="deleteMember('${m.id}')">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteMember(id) {
    if (confirm('Are you sure you want to delete this member?')) {
        members = members.filter(m => m.id !== id);
        saveData();
        renderMembersTable();
        populateSelectDropdowns();
    }
}