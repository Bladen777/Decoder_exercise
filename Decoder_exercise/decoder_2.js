// Set a variable to store the user input
let google_doc_URL;

// Add Event Listeners to HTML File for inputs if needed
const user_input_ele = document.getElementById("user_input")
user_input_ele.addEventListener("change", ()=>{google_doc_URL = user_input_ele.value});
document.getElementById("submit_btn").addEventListener("click", ()=>{get_input_data(google_doc_URL)});

// simple
//get_input_data("https://docs.google.com/document/d/e/2PACX-1vRMx5YQlZNa3ra8dYYxmv-QIQ3YJe8tbI3kqcuC7lQiZm-CSEznKfN_HYNSpoXcZIV3Y_O3YoUB1ecq/pub");

// complex
get_input_data("https://docs.google.com/document/d/e/2PACX-1vQGUck9HIFCyezsrBSnmENk5ieJuYwpt7YHYEzeNJkIb9OSDdx-ov2nRNReKQyey-cwJOoEKUhLmN9z/pub")

// The Function to decode the secret message
async function get_input_data(user_file){
    // Create a variable to store the response from fetching the URL
    let URL_data;
    // Fetch the data for the given URL
    try {
        const response = await fetch(`${user_file}`);
        const data = await response.text();
        URL_data = data;

    } catch (error) {
        console.log(`%c The Error is: `, 'background-color:darkred',error );
    };

    // Take the response and covert it down to a array for better workability        
    const parser = new DOMParser();
    const doc = parser.parseFromString(URL_data, "text/html");
    const tables = doc.querySelectorAll('table');
    //const tables_array = Array.from(tables);

    // testing for multiple tables
        const table = Array.from(tables)[0]; 
        const tables_array = [];
        tables_array.push(table);
        tables_array.push(table);
        tables_array.push(table);

    // Create a variable to store the message
    let message = "";

    // Create a Array to store the message sizes
    let word_sizes = [];

    // Create array to position the message
    const message_grid = [];

    // Break down each table and convert the data into useable information 
    tables_array.map((table, table_index) =>{
        const rows = Array.from(table.rows);
        word_sizes.push({height: 0, width:0});
        // Create titles object to set the object keys
        let titles = {};

        rows.forEach((row, row_index) =>{
            const row_array = Array.from(row.querySelectorAll('td'));

            // Convert each row cell into a string
            const row_cells = row_array.map((cell)=>{
                const cell_text = cell.textContent;
                return cell_text;
            });

            // Take the values of the first row and set them to the object keys
            if(row_index === 0){
                for (let row_column = 0; row_column <= row_array.length - 1; row_column++){
                    const col_title = row_cells[row_column].toLocaleLowerCase();
                    if(col_title.includes("x")){
                        titles.x_col = row_column;
                    } else if (col_title.includes("y")){
                        titles.y_col = row_column;
                    } else if (col_title.includes("character")){
                        titles.character = row_column;
                    }
                }

            // Convert the row cells to proper data types & Create object to store the row values and add it to the row_values array
            } else {
                const character = row_cells[titles.character];
                const x_val = Number(row_cells[titles.x_col]);
                const y_val = Number(row_cells[titles.y_col]);

                // Add the largest size to the word_sizes array to store the sizes of table grids
                if(x_val > word_sizes[table_index].width){
                    word_sizes[table_index].width = x_val + 1
                };
                if(y_val > word_sizes[table_index].height){
                    word_sizes[table_index].height = y_val + 1
                };
                // Define the total sizes of the message by using previous table grid sizes
                let word_height_adjust = 0;
                let word_length = 0;
                word_sizes.forEach((item, index)=>{
                    word_length += item.width;
                    word_height_adjust += item.height;
                });
                const message_length = word_length + 1*table_index;
  
                // Define & adjust the position of characters based on the current sizes of all the tables
                let y_pos = y_val;
                let x_pos = x_val + word_length - word_sizes[table_index].width + 1*table_index;
                if(table_index !== 0 && word_length > 50){
                    y_pos = y_val + word_height_adjust - word_sizes[table_index].height + 2*table_index;
                    x_pos = x_val;
                }

                // Add another array to message_grid for another row
                if(y_pos + 1 > message_grid.length){
                    const height_increase = y_pos - message_grid.length;
                    for(let i = 0; i <= height_increase; i++ ){
                        message_grid.push([])
                    } 
                }

                // Adjust message_grid rows for a increase in size of letters
                for(let i = 0; i < message_length; i++ ){
                    message_grid.forEach((grid_row, grid_row_index)=>{
                        if(!grid_row[i]) 
                        message_grid[grid_row_index].push(" ");
                    })
                }
                
                // Add the current character to the proper poition in the message_grid
                message_grid[y_pos].splice(x_pos,1,character);
            };                   
        });
        
        // Reset the message and define the updated version
        message = "";
        for(let i =0; i <= message_grid.length -1; i++){
            const letter_flip = message_grid.length - 1 - i;
            if(i === 0){
            message += `${message_grid[letter_flip].join("")}`
            } else{
            message +=  `\n ${message_grid[letter_flip].join("")}`
            }
        }
    });
    // The characters being used ░█
    // Send the message out to a console.log
    console.log(`the message:\n \n \n ${message}`);
    console.log(`%cthe message with a background color:\n \n \n ${message}`,'background-color:darkblue');
}
