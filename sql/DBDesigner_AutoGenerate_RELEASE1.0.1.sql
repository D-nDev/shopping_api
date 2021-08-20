CREATE TABLE "public.users" (
	"id" serial NOT NULL,
	"role_id" integer NOT NULL,
	"document" varchar(14) NOT NULL UNIQUE,
	"email" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL,
	"address" varchar(250) NOT NULL,
	"city" varchar(80) NOT NULL,
	"state" varchar(2) NOT NULL,
	"zip_code" varchar(9) NOT NULL,
	"phone" varchar(25) NOT NULL UNIQUE,
	"birth_date" DATE NOT NULL,
	"creation_timestamp" DATETIME NOT NULL DEFAULT 'now()',
	"deleted_at" DATE,
	"reset_code" varchar,
	"expire_time" DATETIME,
	CONSTRAINT "users_pk" PRIMARY KEY ("id","role_id","document")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.providers" (
	"id" serial NOT NULL,
	"document" varchar(14) NOT NULL,
	"name" varchar(100) NOT NULL,
	"country" varchar(20) NOT NULL,
	"state" varchar(20) NOT NULL,
	"product_type" varchar(100) NOT NULL,
	"phone" varchar(25) NOT NULL UNIQUE,
	"zip_code" varchar(9) NOT NULL,
	"creation_timestamp" DATETIME NOT NULL DEFAULT 'now()',
	"deleted_at" DATE,
	"creation_userid" integer NOT NULL,
	CONSTRAINT "providers_pk" PRIMARY KEY ("id","document")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.products" (
	"id" serial NOT NULL,
	"group_id" integer NOT NULL,
	"name" varchar(MAX) NOT NULL,
	"price" DECIMAL(10,2) NOT NULL,
	"description" TEXT NOT NULL,
	"add_date" DATE NOT NULL DEFAULT 'now()',
	"deleted_at" DATE,
	"image" varchar,
	"creation_userid" integer NOT NULL,
	CONSTRAINT "products_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.products_group" (
	"id" serial NOT NULL,
	"name" varchar(255) NOT NULL,
	"creation_timestamp" DATETIME NOT NULL DEFAULT 'now()',
	"deleted_at" DATE,
	"creation_userid" integer NOT NULL,
	CONSTRAINT "products_group_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.stock" (
	"product_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"creation_timestamp" DATETIME NOT NULL DEFAULT 'now()',
	"deleted_at" DATE,
	"creation_userid" integer NOT NULL,
	"update_userid" integer NOT NULL,
	CONSTRAINT "stock_pk" PRIMARY KEY ("product_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.sale_items" (
	"sale_header_id" integer NOT NULL,
	"line" integer NOT NULL,
	"product_id" integer NOT NULL,
	"sold_amount" integer NOT NULL,
	"unitary_value" DECIMAL(10,2) NOT NULL,
	"discount_value" DECIMAL(10,2) NOT NULL,
	"plus_value" DECIMAL(10,2) NOT NULL,
	"total" integer NOT NULL,
	"deleted_at" DATE,
	"refunded" BOOLEAN NOT NULL DEFAULT 'false',
	CONSTRAINT "sale_items_pk" PRIMARY KEY ("sale_header_id","line","product_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.bills_pay" (
	"id" serial NOT NULL,
	"provider_id" integer NOT NULL,
	"amount" FLOAT NOT NULL,
	"currency" varchar(5) NOT NULL,
	"method_id" integer NOT NULL,
	"deadline" DATETIME NOT NULL,
	"creation_timestamp" DATETIME NOT NULL DEFAULT 'now()',
	"deleted_at" DATE,
	"user_id" integer NOT NULL,
	CONSTRAINT "bills_pay_pk" PRIMARY KEY ("id","provider_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.bills_receive" (
	"id" serial NOT NULL,
	"user_id" integer NOT NULL,
	"sale_header_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(3) NOT NULL DEFAULT ''BRL'',
	"method_id" integer NOT NULL,
	"deadline" DATETIME NOT NULL,
	"creation_timestamp" DATETIME NOT NULL DEFAULT 'now()',
	"deleted_at" DATE,
	"refunded" BOOLEAN NOT NULL,
	CONSTRAINT "bills_receive_pk" PRIMARY KEY ("id","user_id","sale_header_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.sale_header" (
	"id" serial NOT NULL,
	"user_id" integer NOT NULL,
	"promotional_code_id" integer,
	"total" DECIMAL(10,2) NOT NULL,
	"payment_method_id" integer NOT NULL,
	"creation_timestamp" DATETIME NOT NULL DEFAULT 'now()',
	"deadline" DATE NOT NULL,
	"deleted_at" DATE,
	"refunded" BOOLEAN NOT NULL DEFAULT 'false',
	CONSTRAINT "sale_header_pk" PRIMARY KEY ("id","user_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.promotional_codes" (
	"id" serial NOT NULL,
	"code" varchar(30) NOT NULL UNIQUE,
	"discount" DECIMAL(10,2) NOT NULL,
	"type_discount" varchar(10) NOT NULL,
	"deleted_at" DATE,
	"creation_userid" integer NOT NULL,
	CONSTRAINT "promotional_codes_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.roles" (
	"id" serial NOT NULL,
	"name" varchar(20) NOT NULL,
	"deleted_at" DATE,
	CONSTRAINT "roles_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.payment_method" (
	"id" serial NOT NULL,
	"name" varchar NOT NULL,
	"portion_quantity" integer NOT NULL,
	"deleted_at" DATE,
	"daystopay" integer NOT NULL,
	CONSTRAINT "payment_method_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.req_refunds" (
	"id" serial NOT NULL,
	"user_id" integer NOT NULL,
	"reason" TEXT NOT NULL,
	"sale_header_id" integer NOT NULL,
	"deleted_at" DATE,
	CONSTRAINT "req_refunds_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



ALTER TABLE "users" ADD CONSTRAINT "users_fk0" FOREIGN KEY ("role_id") REFERENCES "roles"("id");

ALTER TABLE "providers" ADD CONSTRAINT "providers_fk0" FOREIGN KEY ("creation_userid") REFERENCES "users"("id");

ALTER TABLE "products" ADD CONSTRAINT "products_fk0" FOREIGN KEY ("group_id") REFERENCES "products_group"("id");
ALTER TABLE "products" ADD CONSTRAINT "products_fk1" FOREIGN KEY ("creation_userid") REFERENCES "users"("id");

ALTER TABLE "products_group" ADD CONSTRAINT "products_group_fk0" FOREIGN KEY ("creation_userid") REFERENCES "users"("id");

ALTER TABLE "stock" ADD CONSTRAINT "stock_fk0" FOREIGN KEY ("product_id") REFERENCES "products"("id");
ALTER TABLE "stock" ADD CONSTRAINT "stock_fk1" FOREIGN KEY ("creation_userid") REFERENCES "users"("id");
ALTER TABLE "stock" ADD CONSTRAINT "stock_fk2" FOREIGN KEY ("update_userid") REFERENCES "users"("id");

ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_fk0" FOREIGN KEY ("sale_header_id") REFERENCES "sale_header"("id");
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_fk1" FOREIGN KEY ("product_id") REFERENCES "products"("id");

ALTER TABLE "bills_pay" ADD CONSTRAINT "bills_pay_fk0" FOREIGN KEY ("provider_id") REFERENCES "providers"("id");
ALTER TABLE "bills_pay" ADD CONSTRAINT "bills_pay_fk1" FOREIGN KEY ("method_id") REFERENCES "payment_method"("id");
ALTER TABLE "bills_pay" ADD CONSTRAINT "bills_pay_fk2" FOREIGN KEY ("user_id") REFERENCES "users"("id");

ALTER TABLE "bills_receive" ADD CONSTRAINT "bills_receive_fk0" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "bills_receive" ADD CONSTRAINT "bills_receive_fk1" FOREIGN KEY ("sale_header_id") REFERENCES "sale_header"("id");
ALTER TABLE "bills_receive" ADD CONSTRAINT "bills_receive_fk2" FOREIGN KEY ("method_id") REFERENCES "payment_method"("id");

ALTER TABLE "sale_header" ADD CONSTRAINT "sale_header_fk0" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "sale_header" ADD CONSTRAINT "sale_header_fk1" FOREIGN KEY ("promotional_code_id") REFERENCES "promotional_codes"("id");
ALTER TABLE "sale_header" ADD CONSTRAINT "sale_header_fk2" FOREIGN KEY ("payment_method_id") REFERENCES "payment_method"("id");

ALTER TABLE "promotional_codes" ADD CONSTRAINT "promotional_codes_fk0" FOREIGN KEY ("creation_userid") REFERENCES "users"("id");



ALTER TABLE "req_refunds" ADD CONSTRAINT "req_refunds_fk0" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "req_refunds" ADD CONSTRAINT "req_refunds_fk1" FOREIGN KEY ("sale_header_id") REFERENCES "sale_header"("id");














