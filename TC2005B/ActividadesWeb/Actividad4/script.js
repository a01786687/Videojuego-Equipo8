$(".dayButton").click(function() { 
    const day = $(this).data("day")

    fetch(`http://localhost:8080/api/menuItems/${day}`)
        .then(res => res.json())
        .then(items => {
            const container = $("#menuDisplay")

            container.fadeOut(200, function() {
                container.empty()

                items.forEach(item => {
                    container.append(`
                        <div class="menuCard">
                            <h3>${item.name}</h3>
                            <p>${item.description}</p>
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                    `)
                })

                container.fadeIn(200)
            })
        })
})