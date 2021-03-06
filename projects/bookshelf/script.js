const BOOK_STACKS = 6;
const BOOKS_PER_STACK = 4;
const OUTER_STARS_HEIGHT = 50;
const MAX_RATING = 5;
const YELLOW = 1, GREEN = 2, RED = 3, BLUE = 4;

let bookShelf = new Array(BOOK_STACKS).fill(null).map((v) => Array(0));

class BookTitle extends HTMLElement {
    constructor() {
        super();
    }
}

class BookAuthor extends HTMLElement {
    constructor() {
        super();
    }
}

class BookRead extends HTMLElement {
    constructor() {
        super();
    }
}

customElements.define('book-title',BookTitle);
customElements.define('book-author',BookAuthor);
customElements.define('book-read',BookRead);

var Book = function(title,author,numPages = '',hasRead = false,summary = '',rating = 1,type) {
    this.title = title;
    this.author = author;
    this.numPages = numPages;
    this.hasRead = hasRead;
    this.summary = summary;
    this.rating = rating;
    this.type = type ? type : this.randomizeBookType([1,2,3,4],[.15,.15,.35,.35]);
}

Book.prototype.createRandomNum = function(min,max) {
    return Math.random() * (max - min) + min;
}

Book.prototype.randomizeBookType = function(types,weights) {
    let totalWeight = weights.reduce((sum,currVal) => sum += currVal,0);
    let weightSum = 0;
    let randomNum = this.createRandomNum(0,totalWeight);

    for(let i = 0; i < weights.length; i++) {
        weightSum += +weights[i].toFixed(2);

        if(randomNum <= weightSum) {
            return types[i];
        }
    }
}

var getNextBookLocation = function(bookShelf,stackID) {
    return bookShelf[stackID].length;
}

var getBookRating = function(ratingButtons) {
    for(let rating of ratingButtons) {
        if(rating.checked === true) {
            return rating.value;
        }
    }

    return 1;
}

var parseID = function(idString) {
    let location = {type: null, stack: null, book: null};

    let temp = idString.split('-');

    if(temp[0] === 's') {
        location.type = 's';
        location.stack = +temp[1];
    } else {
        location.type = 'b';

        temp = temp[1].split('_');
        location.stack = +temp[0];
        location.book = +temp[1];
    }

    return location;
}

var addBookDetails = function(bookElement,book) {
    let newBookTitle = document.createElement('book-title');
    let newBookAuthor = document.createElement('book-author');
    let newBookRead = document.createElement('book-read');
    newBookTitle.innerText = book.title;
    newBookAuthor.innerText = book.author;
    newBookRead.innerText = book.hasRead ? 'Read' : 'Unread';

    bookElement.appendChild(newBookTitle);
    bookElement.appendChild(newBookAuthor);
    bookElement.appendChild(newBookRead);
}

var addRatingToBook = function(bookElement,bookRating) {
    let newBookOuterStars = document.createElement('div');
    let newBookInnerStars = document.createElement('div');

    newBookOuterStars.classList.add('stars_wrapper');
    newBookInnerStars.classList.add('stars_inner');
    newBookInnerStars.style.height = OUTER_STARS_HEIGHT * bookRating / MAX_RATING + 'px';
    newBookOuterStars.appendChild(newBookInnerStars);
    bookElement.appendChild(newBookOuterStars);
}

var addDeleteButtonToBook = function(bookElement,stackID,bookID) {
    let bookDelButton = document.createElement('a');
    bookDelButton.classList.add('delete_book');

    bookDelButton.addEventListener('click',(event) => {
        event.stopPropagation();
        bookDelButton.parentNode.remove();
        bookShelf[stackID].splice(bookID,1);
        
        localStorage.setItem('books',JSON.stringify(bookShelf));
    });

    bookElement.appendChild(bookDelButton);
}

var addBookClickEvent = function(bookElement,newBookDetails) {
    bookElement.addEventListener('click',(event) => {
        event.stopPropagation();
        editFormTitle.innerText = 'Update Book';
        selectedElement.value = bookElement.id;

        bookDetails.title.value = newBookDetails.title;
        bookDetails.author.value = newBookDetails.author;
        bookDetails.numPages.value = newBookDetails.numPages;
        bookDetails.summary.value = newBookDetails.summary;
        bookDetails.hasRead.checked = newBookDetails.hasRead;
        bookDetails.rating[newBookDetails.rating - 1].checked = true;

        editForm.classList.add('show');
    });
}

var addBookToShelf = function(newBookDetails,stackID,bookID) {
    let newBookElement = document.createElement('div');

    newBookElement.id = 'b-' + stackID + '_' + bookID;
    newBookElement.classList.add('book');
    newBookElement.classList.add(`book_type${newBookDetails.type}`);

    addBookDetails(newBookElement,newBookDetails);

    addRatingToBook(newBookElement,newBookDetails.rating);

    addDeleteButtonToBook(newBookElement,stackID,bookID);

    addBookClickEvent(newBookElement,newBookDetails);

    let bookStack = document.querySelector(`#s-${stackID}`);
    bookStack.prepend(newBookElement);
}

var updateBook = function(book,bookID) {
    let bookSelector = document.querySelector(`#${bookID}`);

    let bookTitle = bookSelector.getElementsByTagName('book-title')[0];
    let bookAuthor = bookSelector.getElementsByTagName('book-author')[0];
    let bookRead = bookSelector.getElementsByTagName('book-read')[0];
    let bookRating = bookSelector.querySelector('.stars_inner');
    
    bookTitle.innerText = book.title;
    bookAuthor.innerText = book.author;
    bookRead.innerText = book.hasRead ? 'Read' : 'Unread';
    bookRating.style.height = OUTER_STARS_HEIGHT * book.rating / MAX_RATING + 'px';
}

var setDefaultBooks = function() {
    let bookTest = new Book('Cracking the Coding Interview','Gayle Laakmann McDowell',687,false,'',2,GREEN);
    let stackID = 0, bookID = getNextBookLocation(bookShelf,stackID);
    bookShelf[stackID].push(bookTest);
    addBookToShelf(bookTest,stackID,bookID);

    bookTest = new Book('Code','Charles Petzold',400,true,'',5,RED);
    bookID = getNextBookLocation(bookShelf,stackID);
    bookShelf[stackID].push(bookTest);
    addBookToShelf(bookTest,stackID,bookID);

    bookTest = new Book('Clean Code','Robert C. Martin',200,false,'',3,RED);
    stackID++;
    bookID = getNextBookLocation(bookShelf,stackID)
    bookShelf[stackID].push(bookTest);
    addBookToShelf(bookTest,stackID,bookID);

    bookTest = new Book('Operating Systems: Three Easy Pieces','Remzi H Arpaci-Dusseau',714,false,'',4,BLUE);
    bookID = getNextBookLocation(bookShelf,stackID)
    bookShelf[stackID].push(bookTest);
    addBookToShelf(bookTest,stackID,bookID);

    bookTest = new Book('Elements of Programming Interviews in Java','Aziz, Lee and Prakash',482,false,'',4,YELLOW);
    stackID++
    bookID = getNextBookLocation(bookShelf,stackID)
    bookShelf[stackID].push(bookTest);
    addBookToShelf(bookTest,stackID,bookID);
}

var deleteBooks = function() {
    for(let stack = 0; stack < bookShelf.length; stack++) {
        for(let book = 0; book < bookShelf[stack].length; book++) {
            let currBook = document.querySelector(`#b-${stack}_${book}`);
            currBook.remove();
        }

        bookShelf[stack].length = 0;
    }
}

var resetBookShelf = function() {
    deleteBooks();
    
    localStorage.clear();
    
    setDefaultBooks();
}

let resetAll = document.querySelector('#reset');
resetAll.addEventListener('click',() => resetBookShelf(bookShelf));

let selectedElement = document.querySelector('#selected');
let editForm = document.querySelector('#edit_form');
let editFormTitle = document.querySelector('#edit_form_title');

let bookDetails = {};
bookDetails.title = document.querySelector('#book_title');
bookDetails.author = document.querySelector('#book_author');
bookDetails.numPages = document.querySelector('#book_pages');
bookDetails.summary = document.querySelector('#book_summary');
bookDetails.rating = document.getElementsByName('book_rating');
bookDetails.hasRead = document.querySelector('#has_read');

let cancelButton = document.querySelector('#cancel');
cancelButton.addEventListener('click',() => {
    editForm.classList.remove('show');
});

let stacks = document.querySelectorAll('.shelf_stack');
stacks.forEach((stack) => {
    stack.addEventListener('click',() => {
        editForm.reset();
        selectedElement.value = stack.id;
        editFormTitle.innerText = 'New Book';
        editForm.classList.add('show');
    });
});

editForm.addEventListener('submit',(event) => {
    event.preventDefault();

    let location = parseID(selectedElement.value);
    
    if(location.type !== null) {
        if(location.type === 's') {
            if(bookShelf[location.stack].length === BOOKS_PER_STACK) {
                alert("Sorry, that stack is full. Try another one, or delete some if there's no room.");
            } else {
                let newBook = new Book(bookDetails.title.value,
                    bookDetails.author.value,
                    bookDetails.numPages.value,
                    bookDetails.hasRead.checked,
                    bookDetails.summary.value,
                    getBookRating(bookDetails.rating)
                );

                bookShelf[location.stack].push(newBook);
                location.book = getNextBookLocation(bookShelf,location.stack);

                addBookToShelf(newBook,location.stack,location.book)
            }
        } else if(location.type === 'b') {
            bookShelf[location.stack][location.book].title = bookDetails.title.value;
            bookShelf[location.stack][location.book].author = bookDetails.author.value;
            bookShelf[location.stack][location.book].numPages = bookDetails.numPages.value;
            bookShelf[location.stack][location.book].hasRead = bookDetails.hasRead.checked;
            bookShelf[location.stack][location.book].summary = bookDetails.summary.value;
            bookShelf[location.stack][location.book].rating = getBookRating(bookDetails.rating);

            updateBook(bookShelf[location.stack][location.book],`b-${location.stack}_${location.book}`);
        }

        editForm.reset();
        editForm.classList.remove('show');

        localStorage.setItem('books',JSON.stringify(bookShelf));
    }

});

if(localStorage.getItem('books')) {
    bookShelf = JSON.parse(localStorage.getItem('books'));

    for(let stack = 0; stack < bookShelf.length; stack++) {
        for(let book = 0; book < bookShelf[stack].length; book++) {
            addBookToShelf(bookShelf[stack][book],stack,book);
        }
    }
} else {
    setDefaultBooks();
}



