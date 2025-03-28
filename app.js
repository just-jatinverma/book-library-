// script.js

let currentPage = 1; // Keeps track of the current page of books being fetched
let books = []; // Stores the list of books fetched from the API
let viewMode = "grid"; // Default view mode for displaying books (grid or list)

// Get references to HTML elements
const bookContainer = document.getElementById("book-container");
const searchInput = document.getElementById("search");
const sortTitleBtn = document.getElementById("sortTitle");
const sortDateBtn = document.getElementById("sortDate");
const toggleViewBtn = document.getElementById("toggleView");

// Function to fetch books from the API with pagination support
async function fetchBooks(page = 1) {
  try {
    const response = await fetch(
      `https://api.freeapi.app/api/v1/public/books?page=${page}`
    );
    const result = await response.json();

    // Check if the API response is valid
    if (!result.data || !result.data.data) {
      console.error("Invalid API response format:", result);
      return;
    }

    // Remove duplicate books to avoid redundant entries
    const newBooks = result.data.data.filter(
      (newBook) => !books.some((existingBook) => existingBook.id === newBook.id)
    );

    // Append new books to the existing books array
    books = books.concat(newBooks);
    renderBooks(books); // Render updated book list
  } catch (error) {
    console.error("Error fetching books:", error);
  }
}

// Function to display books on the webpage
function renderBooks(booksToRender) {
  bookContainer.innerHTML = ""; // Clear existing books before rendering new ones

  booksToRender.forEach((book) => {
    const { volumeInfo, infoLink } = book;
    const bookItem = document.createElement("div");
    bookItem.className = "book-item";

    // Create book item with details
    bookItem.innerHTML = `
      <img src="${
        volumeInfo.imageLinks
          ? volumeInfo.imageLinks.thumbnail
          : "placeholder.jpg"
      }" 
           alt="${volumeInfo.title}">
      <div class="book-details">
        <h3>${volumeInfo.title}</h3>
        <p><strong>Author:</strong> ${
          volumeInfo.authors ? volumeInfo.authors.join(", ") : "N/A"
        }</p>
        <p><strong>Publisher:</strong> ${volumeInfo.publisher || "N/A"}</p>
        <p><strong>Published Date:</strong> ${
          volumeInfo.publishedDate || "N/A"
        }</p>
      </div>
    `;

    // Open book details in a new tab when clicked
    bookItem.addEventListener("click", () => {
      window.open(volumeInfo.infoLink || infoLink, "_blank");
    });

    bookContainer.appendChild(bookItem); // Append book item to the container
  });
}

// Function to filter books based on search input
function filterBooks(query) {
  const filtered = books.filter((book) => {
    const { title, authors } = book.volumeInfo;
    return (
      title.toLowerCase().includes(query.toLowerCase()) ||
      (authors && authors.join(" ").toLowerCase().includes(query.toLowerCase()))
    );
  });
  renderBooks(filtered); // Display filtered books
}

// Function to sort books by title or publication date
function sortBooks(by) {
  const sorted = [...books];

  if (by === "title") {
    // Sort alphabetically by title
    sorted.sort((a, b) => a.volumeInfo.title.localeCompare(b.volumeInfo.title));
  } else if (by === "date") {
    // Sort by publication date (newest first)
    sorted.sort((a, b) => {
      const dateA = a.volumeInfo.publishedDate
        ? new Date(a.volumeInfo.publishedDate)
        : new Date(0); // Default to oldest if date is missing
      const dateB = b.volumeInfo.publishedDate
        ? new Date(b.volumeInfo.publishedDate)
        : new Date(0);
      return dateB - dateA; // Sort in descending order
    });
  }
  renderBooks(sorted); // Display sorted books
}

// Event listener for search input
searchInput.addEventListener("input", (e) => {
  filterBooks(e.target.value);
});

// Event listener for sorting books by title
sortTitleBtn.addEventListener("click", () => {
  sortBooks("title");
});

// Event listener for sorting books by publication date
sortDateBtn.addEventListener("click", () => {
  sortBooks("date");
});

// Event listener for toggling between grid and list view
toggleViewBtn.addEventListener("click", () => {
  viewMode = viewMode === "grid" ? "list" : "grid";
  bookContainer.className = viewMode + "-view"; // Change class to update styling
});

// Infinite scrolling: load next page when user scrolls near the bottom
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    currentPage++;
    fetchBooks(currentPage);
  }
});

// Initial fetch to load the first set of books
fetchBooks(currentPage);
