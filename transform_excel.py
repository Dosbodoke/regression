import pandas as pd


def transform_excel(input_file, output_file):
    # Load the spreadsheet
    df = pd.read_excel(input_file, header=None)

    # Select only the first 48 rows of column A
    column_a_first_48 = df.iloc[:48, 0]

    # Create a new DataFrame to hold the transformed data
    transformed_df = pd.DataFrame(column_a_first_48)

    # Iterate over the remaining rows in chunks of 12
    row_idx = 0
    start_idx = 48
    while start_idx < len(df):
        chunk = df.iloc[start_idx:start_idx + 12, 0]

        # Insert the chunk into the new DataFrame starting at the specified column
        for i in range(len(chunk)):
            transformed_df.at[row_idx, i + 1] = chunk.iloc[i]

        row_idx += 1
        start_idx += 12

    # Save the transformed DataFrame to a new Excel file
    transformed_df.to_excel(output_file, index=False, header=False)

# Example usage
transform_excel('input.xlsx', 'output.xlsx')
