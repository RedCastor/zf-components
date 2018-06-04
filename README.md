UI-SELECT Zurb Foundation 6
=============================

[ui-select][] [Foundation 6][] ui-select Zurb Foundation 6. CSS Foundation 6.

**[Demo][]**


## Installing
```
bower install ui-select-zf6
```

```js
angular.module('app', ['ui.select', 'ui.select.zf6']);
```

```html
<ui-select ng-model="ctrl.country.selected"
           theme="zf6"
           reset-search-input="true"
           search-enabled="false"
           title="Choose an country"
           ng-required="true"
>
    <ui-select-match allow-clear="true" placeholder="Enter an country">{{$select.selected.name}}</ui-select-match>

    <ui-select-header>Top of the list!</ui-select-header>
    <ui-select-choices repeat="country.code as country in ctrl.countries | filter: $select.search" track by $index">
        <div ng-bind-html="country.name | highlight: $select.search"></div>
    </ui-select-choices>
    <ui-select-footer>Bottom of the list.</ui-select-footer>
</ui-select>
```

[Demo]: http://redcastor.github.io/ui-select-zf6/demo/
[Foundation 6]: https://foundation.zurb.com/sites/docs/
[ui-select]: https://getbootstrap.com/
[v1.0.0]: https://github.com/redcastor/ui-select-zf6/releases/tag/v1.0.0
