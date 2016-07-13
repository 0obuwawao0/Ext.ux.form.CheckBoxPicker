/**
 * Created by 2015/6/18.
 * @author : weicong
 * @Description : 可以多选的下拉组件
 * @verion : 1.0
 *
 *
 */
Ext.define('Ext.ux.form.CheckBoxPicker', {
    extend: 'Ext.form.field.Picker',
    xtype: 'checkboxpicker',

    alternateClassName: 'Ext.ux.CheckBoxPicker',

    uses: [],

    requires: ['Ext.panel.Panel', 'Ext.form.CheckboxGroup', 'Ext.form.field.Checkbox'],

    triggerCls: Ext.baseCSSPrefix + 'form-arrow-trigger',

    config: {

        store: null,

        columns: 2,

        maxPickerHeight: 300,

        minPickerHeight: 100,

        delimiter: ',',

        valueField: 'id',

        displayField: 'boxLabel',

        checkedField: 'checked',

        boxName: 'name',

        vertical: false,

        name: null

    },
    applyStore: function (store) {
        if (Ext.isString(store)) {
            return Ext.getStore(store);
        } else {
            return store;
        }
    },

    editable: false,

    /**
     * @event select
     * Fires when a tree node is selected
     * @param {Ext.form.CheckboxGroup} picker        This tree picker
     * @param {Ext.data.Model} record           The selected record
     */

    initComponent: function () {
        var me = this;

        me.checkBoxGroup = new Ext.form.CheckboxGroup({
            hideLabel: true,
            columns: me.columns,
            vertical: me.vertical,
            listeners: {
                scope: me,
                change: me.onItemChange
            }
        });


        me.callParent(arguments);

        me.on('afterrender', me.onAfterRender);

        me.mon(me.store, {
            scope: me,
            load: me.onLoad,
            datachanged: me.onDataChange
        });
    },

    createPicker: function () {
        var me = this,//
            picker = new Ext.panel.Panel({
                layout: 'fit',
                floating: true,
                shrinkWrapDock: 2,
                shadow: false,
                style: 'background',
                pickerField: me,
                scrollable: true,
                hidden: true,
                minHeight: me.minPickerHeight,
                maxHeight: me.maxPickerHeight,
                items: [
                    me.checkBoxGroup
                ],
                listeners: {
                    scope: me,
                    hide: me.onHidePicker
                }

            });

        return picker;
    },

    onAfterRender: function (view) {
        var me = this;
        if (me.store.getCount()) {
            me.createCheckbox(me.store);
        }
    },

    onExpand: function () {
        var me = this,
            value = me.value;

        me.updateCheckBoxGruop(value);

    },

    setValue: function (value) {
        var me = this,
            records, rawValue = [];

        me.value = value;
        //
        if (me.store.loading) {
            // Called while the Store is loading. Ensure it is processed by the onLoad method.
            return me;
        }


        if (Ext.isEmpty(value)) {
            me.updateInput();
            return false;
        }


        records = me.findRecordByValueField(value);
        me.updateInput(records);

    },

    getSubmitValue: function () {
        return this.value;
    },

    getValue: function () {
        return this.value;
    },

    onItemChange: function (view, newValue, oldValue, eOpts) {

        var me = this,//
            records,//
            value = newValue[me.getBoxName()];

        me.setValue(value);
        me.isValid();

    },

    onHidePicker: function () {
        this.isValid();
    },

    updateCheckBoxGruop: function (values) {
        var value = {};

        value[this.getBoxName()] = values;

        this.checkBoxGroup.setValue(value);
    },
    updateInput: function (records) {
        var me = this,//
            vField = me.getValueField(),//
            dField = me.getDisplayField(),//
            rawValue = [];


        if (Ext.isEmpty(records)) {
            me.value = null;
            me.setRawValue();
            return false;
        }

        if (!Ext.isArray(records)) {
            me.value = records.get(vField);
            me.setRawValue(records.get(dField));
            return false;
        }

        me.value = [];


        Ext.each(records, function (_record) {
            me.value.push(_record.get(vField));
            rawValue.push(_record.get(dField));
        });

        me.setRawValue(rawValue.join(me.delimiter));

    },

    findRecordByValueField: function (values) {
        var me = this,
            valueField = me.getValueField(),//
            records = [], rec;


        Ext.each(values, function (_value) {
            rec = me.store.findRecord(valueField, _value);
            if (rec) {
                records.push(rec);
            }
        });

        return records;
    },

    /*
     * 当store载入时*/
    onLoad: function () {
        //console.log('onload');
        /////*重新创建checkbox*/
        ////this.createCheckbox(store);
    },

    /*
     * 当store中的记录有增加 或 减少时*/
    onDataChange: function (store, eOpts) {
        /*重新创建checkbox*/


        if (store.getCount()) {
            this.createCheckbox(store);
        }

    },

    /*
     * 通过store中的记录创建checkbox*/
    createCheckbox: function (store) {
        var me = this,//
            vField = me.getValueField(),//
            lField = me.getDisplayField(),//
            cField = me.getCheckedField(),//
            fName = me.getBoxName(),//
            picker = me.getPicker().down('checkboxgroup'),//
            rec = null, records = [];

        Ext.suspendLayouts();

        picker.removeAll();//每次创建时都删除旧内容
        for (var i = 0; i < store.getCount(); i++) {
            rec = store.getAt(i);
            if (!rec) {
                break;
            }
            picker.add({
                xtype: 'checkbox',
                inputValue: rec.get(vField),
                boxLabel: rec.get(lField),
                checked: rec.get(cField),
                name: fName
            });

            //找出store中已标记为 checked 的记录
            if (rec.get(cField)) {
                records.push(rec);
            }
        }

        //如果Checkboxpicker中有没有定义默认值 value
        if (Ext.isEmpty(me.value)) {
            //那就使用 store 中标记的记录 来设置 checkboxpicker 初始值
            me.updateInput(records);
        }


        Ext.resumeLayouts(true);

    }
    //,
    //onFocusLeave: function (e) {
    //    //var me = this;
    //    //console.log(me.isExpanded);
    //    //
    //    //console.log(e);
    //    //var me = this;
    //    ////me.collapse();
    //    //
    //    //
    //    //console.log(this.picker.down('checkboxgroup').isFocusable());
    //    ////me.callParent([e]);
    //
    //    //console.log(this.up('[floating]'));
    //
    //    //return false;
    //}

});