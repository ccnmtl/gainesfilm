var MAX_RESULTS = 10;

var index = lunr(function() {
    this.field('url');
    this.field('title', {boost: 10});
    this.field('year');
    this.field('category');
    this.field('course');
});
index.ref('url');
var data = {};
$.getJSON('/js/all.json').done(function(item) {
    item.forEach(function(d) {
        index.add(d);
        data[d.url] = d;
    });
}).fail(function(jqxhr, textStatus, error) {
    var err = textStatus + ', ' + error;
    console.error('Error getting Hugo index file:', err);
});

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

var unquote = function(s) {
    s = s.replaceAll('&#34;', '\"');
    return s;
};

var thead = function() {
    var $thead = $('<thead><tr>' +
                   '<th>Title</th>' +
                   '<th>Year</th>' +
                   '<th>Category</th>' +
                   '<th>Course</th>' +
                   '<th>Media</th>' +
                   '</tr></thead>');
    return $thead;
};

var colgroup = function() {
    return $('<colgroup>' +
             '<col style="width: 55%;">' +
             '<col style="width: 5%;">' +
             '<col style="width: 20%;">' +
             '<col style="width: 10%;">' +
             '<col style="width: 10%;">' +
             '</colgroup>');
};

var doSearch = function() {
    var q = $('#q').val();
    var results = index.search(q);
    var $el = $('#search-results');
    $el.empty();
    $el.show();
    $el.append('<div class="arrow"></div>');
    $el.append(
        $('<div class="alert alert-info well">Results for <strong>"' +
          q + '"</strong></div>')
    );
    if (results.length === 0) {
        $el.append('<div class="alert alert-danger q-no-item">' +
                   'Unfortunately, there are ' +
                   'no results matching what you\'re looking for.');
    } else {
        var $table = $('<table class="table table-striped table-condensed">');
        $table.append(colgroup());
        $table.append(thead());
        for (var r in results.slice(0, MAX_RESULTS)) {
            if (results.hasOwnProperty(r)) {
                var d = data[results[r].ref];
                var $tr = $('<tr>');
                var $td = $('<td>');
                var $result = $('<div class="q-item">');
                $result.append($('<a>', {
                    href: d.url,
                    text: unquote(d.title)
                }));
                $td.append($result);
                $tr.append($td);

                var $year = $('<td>', {text: d.year});
                $tr.append($year);

                var $cat = $('<td>', {text: d.category});
                $tr.append($cat);

                var $course = $('<td>', {text: d.course});
                $tr.append($course);

                var $media = $('<td>', {text: d.media});
                $tr.append($media);

                $table.append($tr);
            }
        }
        $el.append($table);
    }
    return false;
};

var clearSearch = function() {
    $('#search-results').empty();
    $('#search-results').hide();
};

$(document).ready(function() {
    $('#search').click(doSearch);
    $('#clear-search').click(clearSearch);
    $('#q').keyup(function() {
        $('#search-results').empty();
        if ($(this).val().length < 2) {
            $('#search-results').hide();
            return;
        }
        return doSearch();
    });

});
