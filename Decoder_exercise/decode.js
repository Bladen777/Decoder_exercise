// Set a variable to store the user input
let google_doc_URL;

// Add Event Listeners to HTML File for inputs if needed
const user_input_ele = document.getElementById("user_input")
user_input_ele.addEventListener("change", ()=>{google_doc_URL = user_input_ele.value});
document.getElementById("submit_btn").addEventListener("click", ()=>{get_input_data(google_doc_URL)});

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
    const tables_array = Array.from(tables);

    // Variable to track the number of rows that will be needed to show the secret
    let secret_height = 0;
    // Array of variables to track the letter size of each table
    let secret_letter_widths = [];

    // Create titles object to set the object keys
    let titles = {};

    // Break down each table and convert the data into useable information 
    const converted_tables = tables_array.map((table) =>{
        const rows = Array.from(table.rows);

        // Variable to track the largest x value of the table
        let secret_width = 0;

        // Create a Array to store the row values
        let row_values = []; 
        rows.forEach((row, row_index) =>{
            const row_array = Array.from(row.querySelectorAll('td'));

            // Convert each row cell into a string
            const row_cells = row_array.map((cell)=>{
                const cell_text = cell.textContent;
                return cell_text;
            });

            // Take the values of the first row and set them to the object keys
            if(row_index === 0){
                titles.col_1 = row_cells[0];
                titles.col_2 = row_cells[1];
                titles.col_3 = row_cells[2];

            // Create object to store the row values and add it to the row_values array
            } else {
                const row_converted = {
                    [titles.col_1]: row_cells[0],
                    [titles.col_2]: row_cells[1],
                    [titles.col_3]: row_cells[2]
                };
                if(row_cells[2] > secret_height){
                    secret_height ++;
                };
                if(row_cells[0] > secret_width){
                    secret_width ++;
                };
                row_values.push(row_converted);
            };                  
        });
        secret_letter_widths.push(secret_width);
        return row_values;
    });

    // Set up arrays to store character positions
    let character_rows = [];
    for (let i=0; i <= secret_height; i++){
        character_rows.push([]);
    };

    // Take each table and convert it into words to send
    converted_tables.map((table, table_index)=>{
        
        // Go from 0 to secret height to add characters to the respective row
        for (let y_check = secret_height; y_check >= 0; y_check--){

            // Create a object to store character for a given row
            let x_characters = {};
            for (let x_range = 0; x_range <= secret_letter_widths[table_index]; x_range++) {
                x_characters[`pos_${x_range}`] =" ";     
            };

            // Check each row for matching y co_ordinate
            table.forEach((row) => {
                let y_cord = Number(row[titles.col_3]);
                let x_cord = Number(row[titles.col_1]);
                let character = row[titles.col_2];
            
                if(y_cord === y_check){
                    x_characters[`pos_${x_cord}`] = character;
                }
            });

            // Take previous letter after the first one is decoded and add to the string
            let row_string = table_index === 0 ? "" : character_rows[y_check][0]; 

            for (let x_range = 0; x_range <= secret_letter_widths[table_index]; x_range++) {
            // Add space in row array for each letter
            if(table_index !== 0 && x_range === 0){
                row_string += ` ` 
            } 
            row_string += `${x_characters[`pos_${x_range}`]}`  
            };

            // Remove existing letter string and add the new string with the additional letters
            character_rows[y_check].shift();
            character_rows[y_check].push(row_string);
        };
    });

    // Create the message from the array of rows
    let the_message = ""; 
    character_rows.forEach((row, index) =>{
        let flip_index = character_rows.length - 1 - index
        the_message += `${character_rows[flip_index]}\n`
    });

    // Log the secret in the console
    console.log(the_message);
    // Use a background as visual glitches appear without one at certain levels of magnification 
    console.log(`%c${the_message}`, 'background-color:darkred');

};
