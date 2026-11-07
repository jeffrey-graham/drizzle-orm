import type { ColumnBuilderBaseConfig, ColumnBuilderRuntimeConfig, MakeColumnConfig } from '~/column-builder.ts';
import type { ColumnBaseConfig } from '~/column.ts';
import { entityKind } from '~/entity.ts';
import type { AnyPgTable } from '~/pg-core/table.ts';
import type { SQL } from '~/sql/sql.ts';
import { type Equal, getColumnNameAndConfig } from '~/utils.ts';
import { PgColumn, PgColumnBuilder } from './common.ts';


export type ConvertCustomConfig<TName extends string, T extends Partial<CustomTypeValues>> =
	& {
		name: TName;
		dataType: 'custom';
		columnType: 'PgCustomColumn';
		data: T['data'];
		driverParam: T['driverData'];
		enumValues: undefined;
	}
	& (T['notNull'] extends true ? { notNull: true } : {})
	& (T['default'] extends true ? { hasDefault: true } : {});


export interface PgCustomColumnInnerConfig {
	customTypeValues: CustomTypeValues;
}


export class PgCustomColumnBuilder<T extends ColumnBuilderBaseConfig<'custom', 'PgCustomColumn'>>
	extends PgColumnBuilder<
		T,
		{
			fieldConfig: CustomTypeValues['config'];
			customTypeParams: CustomTypeParams<any>;
		},
		{
			pgColumnBuilderBrand: 'PgCustomColumnBuilderBrand';
		}
	>
{
	static override readonly [entityKind]: string = 'PgCustomColumnBuilder';


	constructor(
		name: T['name'],
		fieldConfig: CustomTypeValues['config'],
		customTypeParams: CustomTypeParams<any>,
	) {
		super(name, 'custom', 'PgCustomColumn');
		this.config.fieldConfig = fieldConfig;
		this.config.customTypeParams = customTypeParams;
	}


	/** @internal */
	build<TTableName extends string>(
		table: AnyPgTable<{ name: TTableName }>,
	): PgCustomColumn<MakeColumnConfig<T, TTableName>> {
		return new PgCustomColumn<MakeColumnConfig<T, TTableName>>(
			table,
			this.config as ColumnBuilderRuntimeConfig<any, any>,
		);
	}
}


export class PgCustomColumn<T extends ColumnBaseConfig<'custom', 'PgCustomColumn'>> extends PgColumn<T> {
	static override readonly [entityKind]: string = 'PgCustomColumn';


	private sqlName: string;
	private mapTo?: (value: T['data']) => T['driverParam'];
	private mapFrom?: (value: T['driverParam']) => T['data'];
	customSelect?: (identifier: SQL) => SQL;


	constructor(
		table: AnyPgTable<{ name: T['tableName'] }>,
		config: PgCustomColumnBuilder<T>['config'],
	) {
		super(table, config);
		this.sqlName = config.customTypeParams.dataType(config.fieldConfig);
		this.mapTo = config.customTypeParams.toDriver;
		this.mapFrom = config.customTypeParams.fromDriver;
		this.customSelect = config.customTypeParams.customSelect;
	}

