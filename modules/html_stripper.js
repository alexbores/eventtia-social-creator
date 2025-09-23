function stripHtml(htmlString) {
    // The 'gis' flags mean: g (global, all occurrences), i (case-insensitive), s (dot matches newlines).
    let cleanedHtml = htmlString
        .replace(/<script\b[^>]*>.*?<\/script>/gis, '') // Remove <script>...</script>
        .replace(/<style\b[^>]*>.*?<\/style>/gis, '');   // Remove <style>...</style>

    // Optional: You could also strip HTML comments to save more space
    // cleanedHtml = cleanedHtml.replace(//gis, '');

    return cleanedHtml.trim(); // Trim whitespace from the start and end
}

module.exports = { stripHtml };