<%- include("partials/header") %>
<h1>Home</h1>
<section>
    <form action="/" method="get">
        <label for="search">Search for a name:</label>
        <input type="text" id="search" name="q" value="<%= q %>">

        <label for="sortField">Sort by:</label>
        <select name="sortField">
            <option value="Names">Name</option>
            <option value="Age">Age</option>
        </select>

        <label for="sortDirection">Sort direction:</label>
        <select name="sortDirection">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
        </select>

        <button type="submit">Apply</button>
    </form>
</section>

<% if (persons && persons.length > 0) { %>
    <% persons.forEach(function(character) { %>
        <section>
            <article id="home">
            <a href="/characters/<%= character.ID %>">
            <h2><%= character.Names %></h2>
            <img src="<%= character.imageUrl %>" alt="Photo of <%= character.Names %>" style="width: 300px; height:auto;"></a>
            <p><strong>Age: </strong><%= character.Age %></p>
            <p><strong>Description: </strong><%= character.Description %></p>
            </article>
        </section>
    <% }); %>
<% } else { %>
    <p>No characters found.</p>
<% } %>

<%- include("partials/footer") %>
