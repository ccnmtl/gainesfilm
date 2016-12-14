var index = lunr(function() {
    this.field('url');
    this.field('title', {boost: 10});
    this.field('year');
    this.field('category');
    this.field('course');
    this.field('copyright');
    this.field('copyright_notes');
    this.field('director');
    this.field('film_title');
    this.field('image_src');
    this.field('image_url');
    this.field('location');
    this.field('notes');
    this.field('physical_description');
    this.field('repository');
});

var filterBy = {'category': {}, 'course': {}, 'media': {}};

var populateSelect = function(select) {
    var $el = $('#filter-' + select);
    var itemList = Object.keys(filterBy[select]);
    for (var i in itemList.sort()) {
        if (itemList[i] !== '') {
            var $option = $('<option>', {
                value: itemList[i],
                text: itemList[i]
            });
            $el.append($option);
        }
    }
};

index.ref('url');
var data = {};
$.getJSON('/js/all.json').done(function(item) {
    item.forEach(function(d) {
        index.add(d);
        data[d.url] = d;
        filterBy.category[d.category] = d.category;
        filterBy.course[d.course] = d.course;
        filterBy.media[d.media] = d.media;
    });
    populateSelect('category');
    populateSelect('course');
    populateSelect('media');
}).fail(function(jqxhr, textStatus, error) {
    var err = textStatus + ', ' + error;
    console.error('Error getting Hugo index file:', err);
});

var allResults = function() {
    var keys = Object.keys(data);
    return keys.map(function(v) { return data[v]; });
};

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

var unquote = function(s) {
    s = s.replaceAll('&#34;', '\"');
    s = s.replaceAll('&#39;', '\"');
    return s;
};

var filterResults = function(results) {
    var category = $('#filter-category').val();
    var course = $('#filter-course').val();
    var media = $('#filter-media').val();

    var filterCategory = function(element) {
        return element.category === category;
    };
    var filterCourse = function(element) {
        return element.course === course;
    };
    var filterMedia = function(element) {
        return element.media === media;
    };

    if (category !== '') {
        results = results.filter(filterCategory);
    }

    if (course !== '') {
        results = results.filter(filterCourse);
    }

    if (media !== '') {
        results = results.filter(filterMedia);
    }

    return results;
};

// lunr.js returns a list of ids
// resolve them into a list of proper objects
var resolveResults = function(ids) {
    var results = [];
    for (var r in ids) {
        if (ids.hasOwnProperty(r)) {
            var d = data[ids[r].ref];
            results.push(d);
        }
    }
    return results;
};

var insertUnquote = function(v) {
    v.unquotedTitle = unquote(v.title);
    return v;
};

var doFilter = function() {
    var q = $('#filter-q').val();
    var results;
    if (q !== '') {
        results = resolveResults(index.search(q));
    } else {
        results = allResults();
    }
    results = filterResults(results);
    results = results.map(insertUnquote);
    var $el = $('#filter-results');
    $el.empty();
    $el.show();
    var template = _.template($('#filter-results-template').html());
    $el.append(template({'results': results, 'q': q}));
    return false;
};

var clearFilter = function() {
    $('#filter-results').empty();
    $('#filter-results').hide();
};

$(document).ready(function() {
    $('#filter').click(doFilter);
    $('#clear-filter').click(clearFilter);
    $('#filter-q').keyup(function() {
        $('#filter-results').empty();
        if ($(this).val().length < 2) {
            $('#filter-results').hide();
            return;
        }
        return doFilter();
    });
    $('#filter-category').change(function() {
        $('#filter-results').empty();
        $('#filter-results').hide();
        return doFilter();
    });
    $('#filter-course').change(function() {
        $('#filter-results').empty();
        $('#filter-results').hide();
        return doFilter();
    });
    $('#filter-media').change(function() {
        $('#filter-results').empty();
        $('#filter-results').hide();
        return doFilter();
    });

});
