CREATE TABLE IF NOT EXISTS `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`currency` text DEFAULT 'INR' NOT NULL,
	`opening_balance` integer DEFAULT 0 NOT NULL,
	`archived` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT "accounts_currency_iso" CHECK(length("accounts"."currency") = 3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `budgets` (
	`id` text PRIMARY KEY NOT NULL,
	`month` text NOT NULL,
	`currency` text NOT NULL,
	`amount` integer NOT NULL,
	`alerts_enabled` integer DEFAULT true NOT NULL,
	`warning_threshold` integer DEFAULT 80 NOT NULL,
	`critical_threshold` integer DEFAULT 100 NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "budgets_amount_positive" CHECK("budgets"."amount" > 0),
	CONSTRAINT "budgets_currency_iso" CHECK(length("budgets"."currency") = 3)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `budgets_month_currency` ON `budgets` (`month`,`currency`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`icon` text NOT NULL,
	`color` text NOT NULL,
	`system` integer DEFAULT false NOT NULL,
	`archived` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `categories_name_kind` ON `categories` (`name`,`kind`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `notification_events` (
	`id` text PRIMARY KEY NOT NULL,
	`budget_id` text NOT NULL,
	`month` text NOT NULL,
	`threshold` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`budget_id`) REFERENCES `budgets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `notification_once` ON `notification_events` (`budget_id`,`month`,`threshold`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `preferences` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`account_id` text NOT NULL,
	`category_id` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text NOT NULL,
	`occurred_at` integer NOT NULL,
	`notes` text,
	`expense_type` text,
	`transfer_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "transactions_amount_positive" CHECK("transactions"."amount" > 0),
	CONSTRAINT "transactions_currency_iso" CHECK(length("transactions"."currency") = 3)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `transactions_month` ON `transactions` (`occurred_at`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `transactions_account` ON `transactions` (`account_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `transfers` (
	`id` text PRIMARY KEY NOT NULL,
	`from_account_id` text NOT NULL,
	`to_account_id` text NOT NULL,
	`source_amount` integer NOT NULL,
	`destination_amount` integer NOT NULL,
	`source_currency` text NOT NULL,
	`destination_currency` text NOT NULL,
	`occurred_at` integer NOT NULL,
	`notes` text,
	FOREIGN KEY (`from_account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "transfers_source_amount_positive" CHECK("transfers"."source_amount" > 0),
	CONSTRAINT "transfers_destination_amount_positive" CHECK("transfers"."destination_amount" > 0),
	CONSTRAINT "transfers_distinct_accounts" CHECK("transfers"."from_account_id" <> "transfers"."to_account_id"),
	CONSTRAINT "transfers_source_currency_iso" CHECK(length("transfers"."source_currency") = 3),
	CONSTRAINT "transfers_destination_currency_iso" CHECK(length("transfers"."destination_currency") = 3)
);
