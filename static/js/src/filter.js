var index = lunr(function() {
    this.field('url');
    this.field('title', {boost: 10});
    this.field('year');
    this.field('category');
    this.field('course');
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

var titleTH = function(d) {
    var $th = $('<th>');
    var $result = $('<div class="q-item">');
    $result.append($('<a>', {
        href: d.url,
        text: unquote(d.title)
    }));
    $th.append($result);
    return $th;
};

var yearTD = function(d) {
    var $td = $('<td>');
    var $year = $('<a>', {href: '/year/' + d.year + '/', text: d.year});
    $td.append($year);
    return $td;
};

var categoryTD = function(d) {
    var $cat = $('<td>', {text: d.category});
    return $cat;
};

var courseTD = function(d) {
    var $course = $('<td>', {text: d.course});
    return $course;
};

var mediaTD = function(d) {
    var $td = $('<td>');
    var $media = $('<a>', {href: '/media/' + d.media + '/', text: d.media});
    $td.append($media);
    return $td;
};

var doFilter = function() {
    var q = $('#filter-q').val();
    var results;
    if (q !== '') {
        results = resolveResults(index.search(q));
    } else {
        results = allResults();
    }
    var $el = $('#filter-results');
    $el.empty();
    $el.show();
    $el.append('<div class="arrow"></div>');
    results = filterResults(results);
    if (results.length === 0) {
        $el.append('<div class="alert alert-danger q-no-item">' +
                   'Unfortunately, there are ' +
                   'no results matching what you\'re looking for.');
    } else {
        var $table = $('<table class="table table-striped table-condensed">');
        $table.append(colgroup());
        $table.append(thead());
        for (var r in results) {
            var d = results[r];
            var $tr = $('<tr>');
            $tr.append(titleTH(d));
            $tr.append(yearTD(d));
            $tr.append(categoryTD(d));
            $tr.append(courseTD(d));
            $tr.append(mediaTD(d));
            $table.append($tr);
        }
        $el.append($table);
    }
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
